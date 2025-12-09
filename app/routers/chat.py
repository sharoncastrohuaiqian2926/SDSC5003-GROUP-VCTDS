import os
from typing import List, Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db import get_connection

router = APIRouter()


class ChatMessage(BaseModel):
    user_id: Optional[int] = 1
    message: str


class ChatAnswer(BaseModel):
    answer: str


def _fetch_user_top_dishes(user_id: int, limit: int = 5) -> List[dict]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT d.id,
                   d.name,
                   d.category,
                   d.price,
                   c.name AS canteen_name,
                   AVG(r.score) AS avg_score,
                   COUNT(r.id) AS rating_count
            FROM ratings r
            JOIN dishes d ON r.dish_id = d.id
            JOIN canteens c ON d.canteen_id = c.id
            WHERE r.user_id = ?
            GROUP BY d.id, d.name, d.category, d.price, c.name
            ORDER BY avg_score DESC, rating_count DESC
            LIMIT ?
            """,
            (user_id, limit),
        )
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def _fetch_global_top_dishes(limit: int = 10) -> List[dict]:
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT d.id,
                   d.name,
                   d.category,
                   d.price,
                   c.name AS canteen_name,
                   AVG(r.score) AS avg_score,
                   COUNT(r.id) AS rating_count
            FROM ratings r
            JOIN dishes d ON r.dish_id = d.id
            JOIN canteens c ON d.canteen_id = c.id
            GROUP BY d.id, d.name, d.category, d.price, c.name
            HAVING rating_count > 0
            ORDER BY avg_score DESC, rating_count DESC
            LIMIT ?
            """,
            (limit,),
        )
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def _build_context_text(user_top: List[dict], global_top: List[dict]) -> str:
    lines: List[str] = []
    if user_top:
        lines.append("[User Favorite Dishes]")
        for d in user_top:
            lines.append(
                f"- {d['name']} (canteen={d['canteen_name']}, stall={d.get('category')}, "
                f"avg_score={d['avg_score']:.1f}, ratings={d['rating_count']})"
            )
    else:
        lines.append("[User Favorite Dishes]")
        lines.append("- This user has no historical high ratings yet.")

    if global_top:
        lines.append("\n[Global Top Dishes]")
        for d in global_top:
            lines.append(
                f"- {d['name']} (canteen={d['canteen_name']}, stall={d.get('category')}, "
                f"avg_score={d['avg_score']:.1f}, ratings={d['rating_count']})"
            )

    return "\n".join(lines)


async def _call_moonshot(prompt: str, user_message: str) -> str:
    api_key = os.getenv("MOONSHOT_API_KEY")
    model = os.getenv("MOONSHOT_MODEL_NAME", "kimi-k2-0711-preview")
    api_base = os.getenv("MOONSHOT_API_BASE", "https://api.moonshot.cn/v1")
    language = os.getenv("LLM_DEFAULT_LANGUAGE", "zh")
    assistant_name = os.getenv("LLM_ASSISTANT_NAME", "CampusCanteenAssistant")

    if not api_key:
        raise HTTPException(status_code=500, detail="MOONSHOT_API_KEY未配置，请在.env文件中设置API密钥")
    
    # 验证API密钥格式
    if not api_key.startswith("sk-"):
        raise HTTPException(status_code=500, detail="API密钥格式不正确，应以'sk-'开头")

    url = f"{api_base.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    system_prompt = (
        f"你是校园食堂点餐助手 {assistant_name}，主要负责根据数据库中真实存在的菜品、价格和评分信息，帮学生设计合适的点餐组合。"
        f"必须基于下面提供的菜品数据作答，不要编造数据库中不存在的餐厅或菜品；可以根据预算、口味偏好（比如不吃辣、少油）、就餐时间等给出推荐。"
        f"回答语言使用 {language}，语气友好、简洁，并尽量给出具体菜名、食堂和档口信息。"
    )

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {
                "role": "system",
                "content": "以下是根据数据库检索到的热门菜品和评分信息，可用于点餐推荐:\n" + prompt,
            },
            {"role": "user", "content": user_message},
        ],
    }

    try:
        # 配置httpx客户端，处理SSL和代理问题
        client_kwargs = {
            "timeout": 30.0,
            "verify": True,  # SSL验证
        }
        # 如果环境变量设置了代理，使用代理
        http_proxy = os.getenv("HTTP_PROXY") or os.getenv("http_proxy")
        https_proxy = os.getenv("HTTPS_PROXY") or os.getenv("https_proxy")
        if https_proxy or http_proxy:
            proxies = {}
            if https_proxy:
                proxies["https://"] = https_proxy
            if http_proxy:
                proxies["http://"] = http_proxy
            elif https_proxy:
                proxies["http://"] = https_proxy  # 如果没有HTTP代理，使用HTTPS代理
            client_kwargs["proxies"] = proxies
        
        async with httpx.AsyncClient(**client_kwargs) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                error_text = resp.text
                error_detail = f"HTTP {resp.status_code}"
                
                # 尝试解析错误信息
                try:
                    error_json = resp.json()
                    if "error" in error_json:
                        error_info = error_json["error"]
                        error_detail = error_info.get("message", error_info.get("type", error_text))
                except:
                    pass
                
                # 根据状态码提供更友好的错误信息
                if resp.status_code == 401:
                    error_detail = "API密钥无效或已过期，请检查.env文件中的MOONSHOT_API_KEY是否正确"
                elif resp.status_code == 403:
                    error_detail = "API密钥没有访问权限，请检查API密钥的权限设置"
                elif resp.status_code == 429:
                    error_detail = "API调用频率过高，请稍后再试"
                elif resp.status_code >= 500:
                    error_detail = f"Moonshot API服务器错误 ({resp.status_code})，请稍后再试"
                else:
                    error_detail = f"Moonshot API错误 ({resp.status_code}): {error_detail}"
                
                raise HTTPException(status_code=500, detail=error_detail)
            data = resp.json()

        try:
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as exc:
            raise HTTPException(
                status_code=500, 
                detail=f"Invalid response format from Moonshot: {exc}. Response: {data}"
            )
    except httpx.TimeoutException:
        raise HTTPException(status_code=500, detail="请求超时（30秒）。如果使用代理，可能需要配置代理设置或增加超时时间")
    except httpx.ConnectError as e:
        error_msg = str(e)
        if "proxy" in error_msg.lower() or "代理" in error_msg:
            raise HTTPException(
                status_code=500, 
                detail="无法通过代理连接到Moonshot API。请检查：1) 代理设置是否正确 2) 代理服务器是否正常运行 3) 是否需要在.env中配置HTTPS_PROXY"
            )
        raise HTTPException(
            status_code=500, 
            detail=f"无法连接到Moonshot API服务器。请检查：1) 网络连接是否正常 2) 防火墙设置 3) 如果使用代理，请配置HTTPS_PROXY环境变量"
        )
    except httpx.RequestError as e:
        error_msg = str(e)
        if "SSL" in error_msg or "certificate" in error_msg.lower() or "TLS" in error_msg:
            raise HTTPException(
                status_code=500, 
                detail="SSL/TLS连接失败。如果使用代理，可能需要：1) 在.env中配置HTTPS_PROXY 2) 检查代理的SSL证书设置 3) 临时禁用SSL验证（不推荐）"
            )
        raise HTTPException(status_code=500, detail=f"网络请求错误: {error_msg}")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error calling Moonshot API: {str(exc)}")


@router.post("/chat", response_model=ChatAnswer)
async def chat_with_assistant(body: ChatMessage) -> ChatAnswer:
    """Chat endpoint that uses Moonshot LLM + simple RAG over SQLite dishes/ratings."""
    try:
        user_id = body.user_id or 1
        user_top = _fetch_user_top_dishes(user_id=user_id, limit=5)
        global_top = _fetch_global_top_dishes(limit=10)
        context_text = _build_context_text(user_top, global_top)

        answer_text = await _call_moonshot(context_text, body.message)
        return ChatAnswer(answer=answer_text)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Chat error: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)

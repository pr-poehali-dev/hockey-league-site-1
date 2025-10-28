'''
Business: Admin API for managing teams and matches in hockey league
Args: event - dict with httpMethod, body, pathParams
      context - object with request_id attribute
Returns: HTTP response dict with statusCode, headers, body
'''

import json
import os
import psycopg2
from typing import Dict, Any, Optional

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters', {}) or {}
    path: str = query_params.get('path', '')
    
    # CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    # Handle CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Parse path: teams, teams/123, matches, matches/456, matches/456/status
        parts = [p for p in path.split('/') if p] if path else []
        
        if not parts:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Invalid path', 'received': path}),
                'isBase64Encoded': False
            }
        
        resource = parts[0]  # 'teams' or 'matches'
        resource_id = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else None
        action = parts[2] if len(parts) > 2 else None
        
        # TEAMS ENDPOINTS
        if resource == 'teams':
            if method == 'POST':
                # Create new team
                body = json.loads(event.get('body', '{}'))
                name = body.get('name')
                
                if not name:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Name is required'})
                    }
                
                cur.execute(
                    "INSERT INTO teams (name, games, wins, losses, goals_for, goals_against, points) VALUES (%s, 0, 0, 0, 0, 0, 0) RETURNING id",
                    (name,)
                )
                team_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': cors_headers,
                    'body': json.dumps({'id': team_id, 'name': name}),
                    'isBase64Encoded': False
                }
            
            elif method == 'PUT' and resource_id:
                # Update team
                body = json.loads(event.get('body', '{}'))
                name = body.get('name')
                
                if not name:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Name is required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("UPDATE teams SET name = %s WHERE id = %s", (name, resource_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'id': resource_id, 'name': name}),
                    'isBase64Encoded': False
                }
            
            elif method == 'DELETE' and resource_id:
                # Delete team
                cur.execute("DELETE FROM teams WHERE id = %s", (resource_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'deleted': True}),
                    'isBase64Encoded': False
                }
        
        # MATCHES ENDPOINTS
        elif resource == 'matches':
            if method == 'POST':
                # Create new match
                body = json.loads(event.get('body', '{}'))
                home_team = body.get('homeTeam')
                away_team = body.get('awayTeam')
                date = body.get('date')
                time = body.get('time')
                twitch = body.get('twitchChannel', '')
                
                if not all([home_team, away_team, date, time]):
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'All fields are required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "INSERT INTO matches (home_team, away_team, date, time, status, twitch_channel) VALUES (%s, %s, %s, %s, 'upcoming', %s) RETURNING id",
                    (home_team, away_team, date, time, twitch if twitch else None)
                )
                match_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': cors_headers,
                    'body': json.dumps({'id': match_id}),
                    'isBase64Encoded': False
                }
            
            elif method == 'PUT' and resource_id:
                if action == 'status':
                    # Update match status
                    body = json.loads(event.get('body', '{}'))
                    status = body.get('status')
                    
                    if status not in ['upcoming', 'live', 'finished']:
                        return {
                            'statusCode': 400,
                            'headers': cors_headers,
                            'body': json.dumps({'error': 'Invalid status'}),
                            'isBase64Encoded': False
                        }
                    
                    cur.execute("UPDATE matches SET status = %s WHERE id = %s", (status, resource_id))
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps({'id': resource_id, 'status': status}),
                        'isBase64Encoded': False
                    }
                else:
                    # Update match details
                    body = json.loads(event.get('body', '{}'))
                    home_team = body.get('homeTeam')
                    away_team = body.get('awayTeam')
                    date = body.get('date')
                    time = body.get('time')
                    twitch = body.get('twitchChannel', '')
                    
                    if not all([home_team, away_team, date, time]):
                        return {
                            'statusCode': 400,
                            'headers': cors_headers,
                            'body': json.dumps({'error': 'All fields are required'}),
                            'isBase64Encoded': False
                        }
                    
                    cur.execute(
                        "UPDATE matches SET home_team = %s, away_team = %s, date = %s, time = %s, twitch_channel = %s WHERE id = %s",
                        (home_team, away_team, date, time, twitch if twitch else None, resource_id)
                    )
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'body': json.dumps({'id': resource_id}),
                        'isBase64Encoded': False
                    }
            
            elif method == 'DELETE' and resource_id:
                # Delete match
                cur.execute("DELETE FROM matches WHERE id = %s", (resource_id,))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'body': json.dumps({'deleted': True}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 404,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Not found'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
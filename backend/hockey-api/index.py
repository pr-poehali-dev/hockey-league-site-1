import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления хоккейной лигой - получение таблицы, матчей и обновление счёта
    Args: event - dict с httpMethod, body, queryStringParameters
          context - object с request_id
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database URL not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            path = event.get('queryStringParameters', {}).get('action', 'standings')
            
            if path == 'standings':
                cur.execute('''
                    SELECT 
                        t.id,
                        t.name,
                        COUNT(CASE WHEN m.status = 'finished' THEN 1 END) as games,
                        COALESCE(SUM(CASE 
                            WHEN (m.home_team_id = t.id AND m.home_score > m.away_score) 
                                OR (m.away_team_id = t.id AND m.away_score > m.home_score) 
                            THEN 1 ELSE 0 
                        END), 0) as wins,
                        COALESCE(SUM(CASE 
                            WHEN (m.home_team_id = t.id AND m.home_score < m.away_score) 
                                OR (m.away_team_id = t.id AND m.away_score < m.home_score) 
                            THEN 1 ELSE 0 
                        END), 0) as losses,
                        COALESCE(SUM(CASE 
                            WHEN m.home_team_id = t.id THEN m.home_score
                            WHEN m.away_team_id = t.id THEN m.away_score
                            ELSE 0
                        END), 0) as goals_for,
                        COALESCE(SUM(CASE 
                            WHEN m.home_team_id = t.id THEN m.away_score
                            WHEN m.away_team_id = t.id THEN m.home_score
                            ELSE 0
                        END), 0) as goals_against,
                        COALESCE(SUM(CASE 
                            WHEN (m.home_team_id = t.id AND m.home_score > m.away_score) 
                                OR (m.away_team_id = t.id AND m.away_score > m.home_score) 
                            THEN 3 ELSE 0 
                        END), 0) as points
                    FROM teams t
                    LEFT JOIN matches m ON (t.id = m.home_team_id OR t.id = m.away_team_id) AND m.status = 'finished'
                    GROUP BY t.id, t.name
                    ORDER BY 8 DESC, (7 - 6) DESC
                ''')
                teams = cur.fetchall()
                
                result = []
                for team in teams:
                    result.append({
                        'id': team['id'],
                        'name': team['name'],
                        'games': team['games'],
                        'wins': team['wins'],
                        'losses': team['losses'],
                        'points': team['points'],
                        'goalsFor': team['goals_for'],
                        'goalsAgainst': team['goals_against']
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            
            elif path == 'matches':
                cur.execute('''
                    SELECT 
                        m.id,
                        m.match_date as date,
                        m.match_time as time,
                        ht.name as home_team,
                        at.name as away_team,
                        m.home_score,
                        m.away_score,
                        m.status,
                        m.twitch_channel
                    FROM matches m
                    JOIN teams ht ON m.home_team_id = ht.id
                    JOIN teams at ON m.away_team_id = at.id
                    ORDER BY m.match_date DESC, m.match_time DESC
                ''')
                matches = cur.fetchall()
                
                result = []
                for match in matches:
                    score = None
                    if match['home_score'] is not None and match['away_score'] is not None:
                        score = f"{match['home_score']}:{match['away_score']}"
                    
                    result.append({
                        'id': match['id'],
                        'date': str(match['date']),
                        'time': str(match['time'])[:5],
                        'homeTeam': match['home_team'],
                        'awayTeam': match['away_team'],
                        'status': match['status'],
                        'score': score,
                        'twitchChannel': match['twitch_channel']
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            
            elif path == 'teams':
                cur.execute('SELECT id, name FROM teams ORDER BY name')
                teams = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(t) for t in teams]),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            match_id = body_data.get('matchId')
            home_score = body_data.get('homeScore')
            away_score = body_data.get('awayScore')
            status = body_data.get('status', 'finished')
            
            if not match_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'matchId is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                UPDATE matches 
                SET home_score = %s, away_score = %s, status = %s
                WHERE id = %s
                RETURNING id
            ''', (home_score, away_score, status, match_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'matchId': match_id}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
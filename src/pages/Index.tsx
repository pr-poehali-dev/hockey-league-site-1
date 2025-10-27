import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Team {
  id: number;
  name: string;
  games: number;
  wins: number;
  losses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface Match {
  id: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  status: 'upcoming' | 'live' | 'finished';
  score?: string;
  twitchChannel?: string;
}

const teams: Team[] = [
  { id: 1, name: 'Северные Волки', games: 12, wins: 10, losses: 2, points: 30, goalsFor: 45, goalsAgainst: 18 },
  { id: 2, name: 'Стальные Акулы', games: 12, wins: 9, losses: 3, points: 27, goalsFor: 42, goalsAgainst: 22 },
  { id: 3, name: 'Огненные Драконы', games: 12, wins: 8, losses: 4, points: 24, goalsFor: 38, goalsAgainst: 25 },
  { id: 4, name: 'Ледяные Медведи', games: 12, wins: 7, losses: 5, points: 21, goalsFor: 35, goalsAgainst: 28 },
  { id: 5, name: 'Грозовые Быки', games: 12, wins: 6, losses: 6, points: 18, goalsFor: 32, goalsAgainst: 32 },
  { id: 6, name: 'Молнии', games: 12, wins: 5, losses: 7, points: 15, goalsFor: 28, goalsAgainst: 35 },
  { id: 7, name: 'Северное Сияние', games: 12, wins: 3, losses: 9, points: 9, goalsFor: 22, goalsAgainst: 40 },
  { id: 8, name: 'Метеоры', games: 12, wins: 2, losses: 10, points: 6, goalsFor: 18, goalsAgainst: 45 },
];

const matches: Match[] = [
  { id: 1, date: '2025-10-28', time: '19:00', homeTeam: 'Северные Волки', awayTeam: 'Огненные Драконы', status: 'upcoming', twitchChannel: 'phl_official' },
  { id: 2, date: '2025-10-28', time: '21:00', homeTeam: 'Стальные Акулы', awayTeam: 'Ледяные Медведи', status: 'upcoming', twitchChannel: 'phl_official' },
  { id: 3, date: '2025-10-27', time: '19:00', homeTeam: 'Грозовые Быки', awayTeam: 'Молнии', status: 'live', score: '2:1', twitchChannel: 'phl_official' },
  { id: 4, date: '2025-10-26', time: '19:00', homeTeam: 'Метеоры', awayTeam: 'Северное Сияние', status: 'finished', score: '3:4' },
  { id: 5, date: '2025-10-26', time: '21:00', homeTeam: 'Северные Волки', awayTeam: 'Стальные Акулы', status: 'finished', score: '4:2' },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('table');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d1810] via-[#3d2418] to-[#2d1810]">
      <header className="border-b border-[#4a3020] bg-gradient-to-r from-[#2d1810] to-[#3d2418] sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in">
              <Icon name="Trophy" className="text-primary" size={40} />
              <div>
                <h1 className="text-3xl font-bold text-primary font-oswald tracking-wider">PHL</h1>
                <p className="text-sm text-muted-foreground">Первая Хоккейная Лига</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'table', label: 'Таблица', icon: 'ListOrdered' },
                { id: 'schedule', label: 'Расписание', icon: 'Calendar' },
                { id: 'teams', label: 'Команды', icon: 'Users' },
                { id: 'info', label: 'Информация', icon: 'Info' },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(item.id)}
                  className={`${
                    activeTab === item.id 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'text-foreground hover:bg-secondary'
                  } transition-all duration-300 font-oswald tracking-wide`}
                >
                  <Icon name={item.icon as any} size={18} className="mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-oswald hidden sm:flex">
                <Icon name="Edit" size={16} className="mr-2" />
                Управление
              </Button>
              <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 font-oswald">
                <Icon name="ShieldCheck" size={16} className="mr-2" />
                Админ
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsContent value="table" className="animate-slide-up">
            <Card className="bg-card/50 backdrop-blur border-border p-6">
              <h2 className="text-2xl font-bold text-primary mb-6 font-oswald flex items-center gap-2">
                <Icon name="Trophy" size={28} />
                Турнирная таблица
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-oswald text-muted-foreground">#</th>
                      <th className="text-left py-3 px-4 font-oswald text-muted-foreground">Команда</th>
                      <th className="text-center py-3 px-2 font-oswald text-muted-foreground">И</th>
                      <th className="text-center py-3 px-2 font-oswald text-muted-foreground">В</th>
                      <th className="text-center py-3 px-2 font-oswald text-muted-foreground">П</th>
                      <th className="text-center py-3 px-2 font-oswald text-muted-foreground">Ш</th>
                      <th className="text-center py-3 px-2 font-oswald text-muted-foreground">ПШ</th>
                      <th className="text-center py-3 px-2 font-oswald text-muted-foreground font-bold text-primary">О</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, index) => (
                      <tr 
                        key={team.id} 
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors duration-200"
                      >
                        <td className="py-3 px-2 font-bold text-muted-foreground">{index + 1}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">{team.name}</td>
                        <td className="text-center py-3 px-2 text-muted-foreground">{team.games}</td>
                        <td className="text-center py-3 px-2 text-green-400">{team.wins}</td>
                        <td className="text-center py-3 px-2 text-red-400">{team.losses}</td>
                        <td className="text-center py-3 px-2 text-muted-foreground">{team.goalsFor}</td>
                        <td className="text-center py-3 px-2 text-muted-foreground">{team.goalsAgainst}</td>
                        <td className="text-center py-3 px-2 font-bold text-primary text-lg">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="animate-slide-up">
            <Card className="bg-card/50 backdrop-blur border-border p-6">
              <h2 className="text-2xl font-bold text-primary mb-6 font-oswald flex items-center gap-2">
                <Icon name="Calendar" size={28} />
                Расписание матчей
              </h2>
              
              <div className="space-y-4">
                {matches.map((match) => (
                  <Card 
                    key={match.id} 
                    className={`p-4 transition-all duration-300 hover:scale-[1.02] ${
                      match.status === 'live' ? 'border-red-500 border-2 shadow-lg shadow-red-500/20' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[80px]">
                          <div className="text-xs text-muted-foreground">{match.date}</div>
                          <div className="text-lg font-bold text-primary font-oswald">{match.time}</div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-foreground min-w-[120px] sm:min-w-[150px] text-right">{match.homeTeam}</span>
                          <span className="text-muted-foreground font-bold">VS</span>
                          <span className="font-semibold text-foreground min-w-[120px] sm:min-w-[150px]">{match.awayTeam}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {match.status === 'live' && (
                          <>
                            <Badge className="bg-red-500 text-white animate-pulse">
                              <Icon name="Radio" size={14} className="mr-1" />
                              LIVE
                            </Badge>
                            {match.score && (
                              <span className="text-xl font-bold text-primary font-oswald">{match.score}</span>
                            )}
                            {match.twitchChannel && (
                              <Button 
                                size="sm" 
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => window.open(`https://twitch.tv/${match.twitchChannel}`, '_blank')}
                              >
                                <Icon name="Video" size={16} className="mr-2" />
                                Смотреть
                              </Button>
                            )}
                          </>
                        )}
                        
                        {match.status === 'finished' && match.score && (
                          <span className="text-lg font-bold text-muted-foreground font-oswald">{match.score}</span>
                        )}
                        
                        {match.status === 'upcoming' && (
                          <Badge variant="outline" className="border-primary text-primary">
                            Скоро
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="animate-slide-up">
            <Card className="bg-card/50 backdrop-blur border-border p-6">
              <h2 className="text-2xl font-bold text-primary mb-6 font-oswald flex items-center gap-2">
                <Icon name="Users" size={28} />
                Команды лиги
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team) => (
                  <Card 
                    key={team.id} 
                    className="p-4 hover:scale-105 transition-transform duration-300 cursor-pointer border-border hover:border-primary"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon name="Shield" size={24} className="text-primary" />
                      </div>
                      <h3 className="font-bold text-lg font-oswald text-foreground">{team.name}</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Игр:</span>
                        <span className="font-semibold text-foreground">{team.games}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Побед:</span>
                        <span className="font-semibold text-green-400">{team.wins}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Поражений:</span>
                        <span className="font-semibold text-red-400">{team.losses}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="text-muted-foreground font-bold">Очки:</span>
                        <span className="font-bold text-primary text-lg">{team.points}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="animate-slide-up">
            <Card className="bg-card/50 backdrop-blur border-border p-6">
              <h2 className="text-2xl font-bold text-primary mb-6 font-oswald flex items-center gap-2">
                <Icon name="Info" size={28} />
                О лиге
              </h2>
              
              <div className="space-y-6 text-foreground">
                <div>
                  <h3 className="text-xl font-bold text-primary mb-2 font-oswald">PHL (Первая Хоккейная Лига) — элита игры PUCK.</h3>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-primary mb-2 font-oswald">Как устроена:</h4>
                  <p className="text-muted-foreground leading-relaxed">Лига включает лучшие команды, соревнующиеся за звание чемпиона.</p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-primary mb-2 font-oswald">Три уровня:</h4>
                  <ul className="space-y-2 ml-4">
                    <li className="text-muted-foreground">
                      <span className="text-primary font-semibold">Аматорсы:</span> Старт для всех. Поднялся в топ — иди выше.
                    </li>
                    <li className="text-muted-foreground">
                      <span className="text-primary font-semibold">Континентальная:</span> Жёсткие сезоны. Сильнейшие команды выходят в Элиту.
                    </li>
                    <li className="text-muted-foreground">
                      <span className="text-primary font-semibold">Элита:</span> Закрытый клуб сильнейших. Регулярка и плей-офф за звание Чемпиона.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-primary mb-2 font-oswald">Движение:</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Рост через попадание в топ рейтинга. Вылетание из Элиты и Континентальной лиги за последние места.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-primary mb-2 font-oswald">Фишка:</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Чем выше лига, тем круче награды. Не просто призы, а эксклюзивы: клюшки, обмотки на них, другие призы, показывающие твой статус.
                  </p>
                </div>

                <div className="pt-6 border-t border-border">
                  <h4 className="text-lg font-bold text-primary mb-4 font-oswald">Наши соц-сети</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      <Icon name="Send" size={18} className="mr-2" />
                      Telegram
                    </Button>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      <Icon name="MessageCircle" size={18} className="mr-2" />
                      Discord
                    </Button>
                    <Button variant="outline" className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
                      <Icon name="Video" size={18} className="mr-2" />
                      Twitch
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border bg-card/30 backdrop-blur mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p className="font-oswald tracking-wide">
            Сайт создан на <span className="text-primary font-bold">poehali.dev</span> 🚀
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
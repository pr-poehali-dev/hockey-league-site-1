import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE = 'https://functions.poehali.dev/d7fefbdb-c2d2-4210-b862-f60c05c1c2c0';

interface Team {
  id: number;
  name: string;
  games: number;
  wins: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'finished';
  score?: string;
  twitchChannel?: string;
}

export default function Admin() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [teamDialog, setTeamDialog] = useState(false);
  const [matchDialog, setMatchDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const [teamForm, setTeamForm] = useState({
    name: '',
  });

  const [matchForm, setMatchForm] = useState({
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    twitchChannel: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const baseApiUrl = 'https://functions.yandexcloud.net/d4e9hkqotov5edubsljb';
      const [teamsRes, matchesRes] = await Promise.all([
        fetch(`${baseApiUrl}/teams`),
        fetch(`${baseApiUrl}/matches`)
      ]);
      
      const teamsData = await teamsRes.json();
      const matchesData = await matchesRes.json();
      
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setMatches(Array.isArray(matchesData) ? matchesData : []);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setTeams([]);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTeam = async () => {
    try {
      const pathParam = editingTeam ? `teams/${editingTeam.id}` : 'teams';
      const url = `${API_BASE}?path=${pathParam}`;
      
      const method = editingTeam ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamForm.name })
      });

      await loadData();
      setTeamDialog(false);
      setEditingTeam(null);
      setTeamForm({ name: '' });
    } catch (error) {
      console.error('Ошибка сохранения команды:', error);
    }
  };

  const handleDeleteTeam = async (id: number) => {
    if (!confirm('Удалить команду?')) return;
    
    try {
      await fetch(`${API_BASE}?path=teams/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (error) {
      console.error('Ошибка удаления команды:', error);
    }
  };

  const handleSaveMatch = async () => {
    try {
      const url = editingMatch 
        ? `${API_BASE}/admin/matches/${editingMatch.id}`
        : `${API_BASE}/admin/matches`;
      
      const method = editingMatch ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchForm)
      });

      await loadData();
      setMatchDialog(false);
      setEditingMatch(null);
      setMatchForm({ homeTeam: '', awayTeam: '', date: '', time: '', twitchChannel: '' });
    } catch (error) {
      console.error('Ошибка сохранения матча:', error);
    }
  };

  const handleDeleteMatch = async (id: number) => {
    if (!confirm('Удалить матч?')) return;
    
    try {
      await fetch(`${API_BASE}/admin/matches/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (error) {
      console.error('Ошибка удаления матча:', error);
    }
  };

  const handleChangeMatchStatus = async (id: number, status: string) => {
    try {
      await fetch(`${API_BASE}/admin/matches/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await loadData();
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
    }
  };

  const openTeamDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setTeamForm({ name: team.name });
    } else {
      setEditingTeam(null);
      setTeamForm({ name: '' });
    }
    setTeamDialog(true);
  };

  const openMatchDialog = (match?: Match) => {
    if (match) {
      setEditingMatch(match);
      setMatchForm({
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        date: match.date,
        time: match.time,
        twitchChannel: match.twitchChannel || '',
      });
    } else {
      setEditingMatch(null);
      setMatchForm({ homeTeam: '', awayTeam: '', date: '', time: '', twitchChannel: '' });
    }
    setMatchDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/30 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="ShieldCheck" size={32} className="text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary font-oswald">Админ-панель</h1>
                <p className="text-sm text-muted-foreground">Управление лигой</p>
              </div>
            </div>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              На главную
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="teams">
              <Icon name="Users" size={16} className="mr-2" />
              Команды
            </TabsTrigger>
            <TabsTrigger value="matches">
              <Icon name="Calendar" size={16} className="mr-2" />
              Матчи
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground font-oswald">Управление командами</h2>
                <Dialog open={teamDialog} onOpenChange={setTeamDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openTeamDialog()}>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить команду
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingTeam ? 'Редактировать команду' : 'Новая команда'}</DialogTitle>
                      <DialogDescription>
                        Введите название команды
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="teamName">Название команды</Label>
                        <Input
                          id="teamName"
                          value={teamForm.name}
                          onChange={(e) => setTeamForm({ name: e.target.value })}
                          placeholder="Название команды"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setTeamDialog(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleSaveTeam} disabled={!teamForm.name}>
                        Сохранить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
              ) : (
                <div className="space-y-2">
                  {teams.map((team) => (
                    <Card key={team.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon name="Shield" size={24} className="text-primary" />
                        <div>
                          <div className="font-semibold text-foreground">{team.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {team.games} игр | {team.wins}В {team.losses}П | {team.points} очков
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openTeamDialog(team)}>
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteTeam(team.id)}>
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="matches">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground font-oswald">Управление матчами</h2>
                <Dialog open={matchDialog} onOpenChange={setMatchDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openMatchDialog()}>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить матч
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingMatch ? 'Редактировать матч' : 'Новый матч'}</DialogTitle>
                      <DialogDescription>
                        Заполните информацию о матче
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="homeTeam">Команда дома</Label>
                          <Select value={matchForm.homeTeam} onValueChange={(v) => setMatchForm({...matchForm, homeTeam: v})}>
                            <SelectTrigger id="homeTeam">
                              <SelectValue placeholder="Выберите команду" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams.map(team => (
                                <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="awayTeam">Команда в гостях</Label>
                          <Select value={matchForm.awayTeam} onValueChange={(v) => setMatchForm({...matchForm, awayTeam: v})}>
                            <SelectTrigger id="awayTeam">
                              <SelectValue placeholder="Выберите команду" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams.map(team => (
                                <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Дата</Label>
                          <Input
                            id="date"
                            value={matchForm.date}
                            onChange={(e) => setMatchForm({...matchForm, date: e.target.value})}
                            placeholder="29 окт"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time">Время</Label>
                          <Input
                            id="time"
                            value={matchForm.time}
                            onChange={(e) => setMatchForm({...matchForm, time: e.target.value})}
                            placeholder="20:00"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitch">Twitch канал (опционально)</Label>
                        <Input
                          id="twitch"
                          value={matchForm.twitchChannel}
                          onChange={(e) => setMatchForm({...matchForm, twitchChannel: e.target.value})}
                          placeholder="название_канала"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setMatchDialog(false)}>
                        Отмена
                      </Button>
                      <Button 
                        onClick={handleSaveMatch} 
                        disabled={!matchForm.homeTeam || !matchForm.awayTeam || !matchForm.date || !matchForm.time}
                      >
                        Сохранить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
              ) : (
                <div className="space-y-2">
                  {matches.map((match) => (
                    <Card key={match.id} className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-muted-foreground">{match.date} {match.time}</span>
                            <span className="font-semibold text-foreground">
                              {match.homeTeam} vs {match.awayTeam}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select value={match.status} onValueChange={(v) => handleChangeMatchStatus(match.id, v)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="upcoming">Скоро</SelectItem>
                                <SelectItem value="live">Live</SelectItem>
                                <SelectItem value="finished">Завершен</SelectItem>
                              </SelectContent>
                            </Select>
                            {match.score && (
                              <span className="text-sm font-bold text-primary">{match.score}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openMatchDialog(match)}>
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteMatch(match.id)}>
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
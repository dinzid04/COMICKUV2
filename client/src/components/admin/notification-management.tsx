import React, { useState, useEffect } from 'react';
import { db } from '@/firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Save, Bell, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NotificationSettings {
  enabled: boolean;
  showStats: boolean;
  message: string;
  imageUrl: string;
  scheduleType: 'session' | 'time_based';
  scheduleValue: number;
  scheduleUnit: 'hours' | 'days';
}

const NotificationManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    showStats: false,
    message: '',
    imageUrl: '',
    scheduleType: 'session',
    scheduleValue: 1,
    scheduleUnit: 'hours'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'settings', 'site_config');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Calculate schedule settings from stored cooldownMinutes
        let type: 'session' | 'time_based' = 'session';
        let val = 1;
        let unit: 'hours' | 'days' = 'hours';

        if (data.cooldownMinutes && data.cooldownMinutes > 0) {
            type = 'time_based';
            const mins = data.cooldownMinutes;
            if (mins >= 1440 && mins % 1440 === 0) {
                val = mins / 1440;
                unit = 'days';
            } else {
                val = Math.ceil(mins / 60);
                unit = 'hours';
            }
        }

        setSettings({
          enabled: data.enabled ?? false,
          showStats: data.showStats ?? false,
          message: data.message ?? '',
          imageUrl: data.imageUrl ?? '',
          scheduleType: type,
          scheduleValue: val,
          scheduleUnit: unit
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: "Gagal memuat pengaturan notifikasi.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      let cooldownMinutes = 0;
      if (settings.scheduleType === 'time_based') {
          if (settings.scheduleUnit === 'hours') {
              cooldownMinutes = settings.scheduleValue * 60;
          } else {
              cooldownMinutes = settings.scheduleValue * 1440; // 24 * 60
          }
      }

      const docRef = doc(db, 'settings', 'site_config');
      await setDoc(docRef, {
        enabled: settings.enabled,
        showStats: settings.showStats,
        message: settings.message,
        imageUrl: settings.imageUrl,
        cooldownMinutes: cooldownMinutes,
        updatedAt: serverTimestamp() // Update timestamp to trigger fresh display if content changed
      }, { merge: true });

      toast({
        title: "Success",
        description: "Pengaturan notifikasi berhasil disimpan."
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Pengaturan Notifikasi Mengambang</CardTitle>
              <CardDescription>
                Konfigurasi pesan popup yang muncul saat pengguna membuka website.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Aktifkan Notifikasi</Label>
              <p className="text-sm text-muted-foreground">
                Tampilkan popup notifikasi kepada semua pengunjung.
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Tampilkan Statistik User</Label>
              <p className="text-sm text-muted-foreground">
                Tampilkan jumlah user online dan offline di dalam notifikasi.
              </p>
            </div>
            <Switch
              checked={settings.showStats}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showStats: checked }))}
            />
          </div>

          <div className="rounded-lg border p-4 space-y-4">
             <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <Label className="text-base">Jadwal Kemunculan</Label>
             </div>

             <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                   <Label>Tipe Jadwal</Label>
                   <Select
                      value={settings.scheduleType}
                      onValueChange={(val: 'session' | 'time_based') => setSettings(prev => ({ ...prev, scheduleType: val }))}
                   >
                      <SelectTrigger>
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="session">Sekali Per Sesi (Setiap Buka Browser)</SelectItem>
                         <SelectItem value="time_based">Berdasarkan Waktu (Cooldown)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                {settings.scheduleType === 'time_based' && (
                    <div className="flex gap-2 items-end">
                       <div className="space-y-2 flex-1">
                          <Label>Durasi Jeda</Label>
                          <Input
                             type="number"
                             min="1"
                             value={settings.scheduleValue}
                             onChange={(e) => setSettings(prev => ({ ...prev, scheduleValue: parseInt(e.target.value) || 1 }))}
                          />
                       </div>
                       <div className="space-y-2 w-32">
                          <Label>Satuan</Label>
                          <Select
                             value={settings.scheduleUnit}
                             onValueChange={(val: 'hours' | 'days') => setSettings(prev => ({ ...prev, scheduleUnit: val }))}
                          >
                             <SelectTrigger>
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                                <SelectItem value="hours">Jam</SelectItem>
                                <SelectItem value="days">Hari</SelectItem>
                             </SelectContent>
                          </Select>
                       </div>
                    </div>
                )}
             </div>
             <p className="text-xs text-muted-foreground">
                {settings.scheduleType === 'session'
                   ? "Notifikasi akan muncul setiap kali user menutup dan membuka kembali browser (Session Storage)."
                   : `Notifikasi akan muncul kembali setelah ${settings.scheduleValue} ${settings.scheduleUnit === 'hours' ? 'Jam' : 'Hari'} sejak terakhir ditutup.`
                }
             </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Pesan Teks</Label>
            <Textarea
              id="message"
              placeholder="Masukkan pesan pengumuman..."
              value={settings.message}
              onChange={(e) => setSettings(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Kosongkan jika hanya ingin menampilkan gambar atau statistik.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL Gambar (Opsional)</Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={settings.imageUrl}
              onChange={(e) => setSettings(prev => ({ ...prev, imageUrl: e.target.value }))}
            />
          </div>

          {settings.imageUrl && (
            <div className="mt-4">
              <Label>Preview Gambar</Label>
              <div className="mt-2 relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border bg-muted">
                <img
                  src={settings.imageUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </div>
          )}

          <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManagement;

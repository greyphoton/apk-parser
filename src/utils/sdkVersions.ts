export interface AndroidVersionInfo {
  api: number;
  version: string;
  codeName: string;
  releaseYear: number;
}

export const ANDROID_VERSIONS: Record<number, AndroidVersionInfo> = {
  14: { api: 14, version: '4.0', codeName: 'Ice Cream Sandwich', releaseYear: 2011 },
  15: { api: 15, version: '4.0.3', codeName: 'Ice Cream Sandwich', releaseYear: 2011 },
  16: { api: 16, version: '4.1', codeName: 'Jelly Bean', releaseYear: 2012 },
  17: { api: 17, version: '4.2', codeName: 'Jelly Bean', releaseYear: 2012 },
  18: { api: 18, version: '4.3', codeName: 'Jelly Bean', releaseYear: 2013 },
  19: { api: 19, version: '4.4', codeName: 'KitKat', releaseYear: 2013 },
  21: { api: 21, version: '5.0', codeName: 'Lollipop', releaseYear: 2014 },
  22: { api: 22, version: '5.1', codeName: 'Lollipop', releaseYear: 2015 },
  23: { api: 23, version: '6.0', codeName: 'Marshmallow', releaseYear: 2015 },
  24: { api: 24, version: '7.0', codeName: 'Nougat', releaseYear: 2016 },
  25: { api: 25, version: '7.1', codeName: 'Nougat', releaseYear: 2016 },
  26: { api: 26, version: '8.0', codeName: 'Oreo', releaseYear: 2017 },
  27: { api: 27, version: '8.1', codeName: 'Oreo', releaseYear: 2017 },
  28: { api: 28, version: '9.0', codeName: 'Pie', releaseYear: 2018 },
  29: { api: 29, version: '10', codeName: 'Quince Tart (10)', releaseYear: 2019 },
  30: { api: 30, version: '11', codeName: 'Red Velvet Cake (11)', releaseYear: 2020 },
  31: { api: 31, version: '12', codeName: 'Snow Cone (12)', releaseYear: 2021 },
  32: { api: 32, version: '12L', codeName: 'Snow Cone v2', releaseYear: 2022 },
  33: { api: 33, version: '13', codeName: 'Tiramisu (13)', releaseYear: 2022 },
  34: { api: 34, version: '14', codeName: 'Upside Down Cake (14)', releaseYear: 2023 },
  35: { api: 35, version: '15', codeName: 'Vanilla Ice Cream (15)', releaseYear: 2024 },
  36: { api: 36, version: '16', codeName: 'Baklava (16)', releaseYear: 2025 },
  37: { api: 37, version: '17', codeName: 'Preview (17)', releaseYear: 2026 },
};

export function getAndroidVersionInfo(apiLevel?: number): AndroidVersionInfo {
  if (!apiLevel) {
    return { api: 0, version: 'Unknown', codeName: 'Unknown', releaseYear: 2020 };
  }
  return (
    ANDROID_VERSIONS[apiLevel] || {
      api: apiLevel,
      version: `API ${apiLevel}`,
      codeName: `API ${apiLevel}`,
      releaseYear: 2024,
    }
  );
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

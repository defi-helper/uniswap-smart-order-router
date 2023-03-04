interface Data {
  value: string;
  end: number;
}

export class Cache {
  static TICK = 10;

  constructor(private readonly map = new Map<string, Data>()) {}

  set(key: string, value: string, ttlTicks: number) {
    this.map.set(key, { value, end: Date.now() + ttlTicks * Cache.TICK * 1000 });
  }

  get(key: string) {
    return this.map.get(key)?.value;
  }

  clear() {
    const now = Date.now();
    this.map.forEach(({ end }, key) => {
      if (end >= now) return;
      this.map.delete(key);
    });
  }
}

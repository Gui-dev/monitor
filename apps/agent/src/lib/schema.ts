import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const metrics = sqliteTable('metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp').notNull(),
  hostname: text('hostname').notNull(),
  kernel: text('kernel').notNull(),
  uptime: text('uptime').notNull(),

  // CPU
  cpuOverall: real('cpu_overall').notNull(),
  cpuCores: text('cpu_cores').notNull(), // JSON array
  cpuTemp: real('cpu_temp'),
  cpuModel: text('cpu_model').notNull(),
  cpuSpeed: real('cpu_speed').notNull(),

  // RAM
  ramTotal: integer('ram_total').notNull(),
  ramUsed: integer('ram_used').notNull(),
  ramFree: integer('ram_free').notNull(),
  ramCached: integer('ram_cached').notNull(),
  ramPercent: real('ram_percent').notNull(),

  // Disk
  diskTotal: integer('disk_total').notNull(),
  diskUsed: integer('disk_used').notNull(),
  diskPercent: real('disk_percent').notNull(),
  diskReadSpeed: real('disk_read_speed').notNull(),
  diskWriteSpeed: real('disk_write_speed').notNull(),
  diskDevice: text('disk_device').notNull(),
  diskMountpoint: text('disk_mountpoint').notNull(),

  // Network
  networkRx: real('network_rx').notNull(),
  networkTx: real('network_tx').notNull(),
  networkInterface: text('network_interface').notNull(),

  // Processes (JSON)
  processes: text('processes').notNull(),

  // Load Average
  loadAvg1: real('load_avg_1').notNull(),
  loadAvg5: real('load_avg_5').notNull(),
  loadAvg15: real('load_avg_15').notNull(),
})

export type MetricRow = typeof metrics.$inferSelect
export type MetricInsert = typeof metrics.$inferInsert

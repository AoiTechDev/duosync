import { 
    pgTable, 
    text, 
    timestamp, 
    boolean, 
    json,
    pgEnum,
    uuid,
    integer,
    unique
  } from 'drizzle-orm/pg-core'
  import { relations } from 'drizzle-orm'
  
  export const roleEnum = pgEnum('role', [
    'TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT', 'FILL'
  ])
  
  export const rankEnum = pgEnum('rank', [
    'IRON_4', 'IRON_3', 'IRON_2', 'IRON_1',
    'BRONZE_4', 'BRONZE_3', 'BRONZE_2', 'BRONZE_1',
    'SILVER_4', 'SILVER_3', 'SILVER_2', 'SILVER_1',
    'GOLD_4', 'GOLD_3', 'GOLD_2', 'GOLD_1',
    'PLATINUM_4', 'PLATINUM_3', 'PLATINUM_2', 'PLATINUM_1',
    'EMERALD_4', 'EMERALD_3', 'EMERALD_2', 'EMERALD_1',
    'DIAMOND_4', 'DIAMOND_3', 'DIAMOND_2', 'DIAMOND_1',
    'MASTER', 'GRANDMASTER', 'CHALLENGER'
  ])
  
  export const regionEnum = pgEnum('region', [
    'NA1', 'EUW1', 'EUN1', 'KR', 'BR1', 'LA1', 'LA2', 'OC1', 'RU', 'TR1', 'JP1'
  ])
  
  export const gameModeEnum = pgEnum('game_mode', [
    'RANKED_SOLO', 'RANKED_FLEX', 'NORMAL', 'ARAM'
  ])
  
  export const friendshipStatusEnum = pgEnum('friendship_status', [
    'PENDING', 'ACCEPTED', 'BLOCKED'
  ])
  
  export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').unique().notNull(),
    username: text('username').unique().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    
    summonerName: text('summoner_name'),
    region: regionEnum('region'),
    currentRank: rankEnum('current_rank'),
    peakRank: rankEnum('peak_rank'),
    mainRole: roleEnum('main_role'),
    secondaryRole: roleEnum('secondary_role'),
    bio: text('bio'),
    avatar: text('avatar'),
    
    playstyle: json('playstyle').$type<string[]>(),
    communication: json('communication').$type<string[]>(),
    goals: json('goals').$type<string[]>(),
    availability: json('availability'),
  })
  
  export const posts = pgTable('posts', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),

    lookingFor: json('looking_for').$type<string[]>(),
    rankRange: json('rank_range').$type<{min: string, max: string}>(),
    region: regionEnum('region').notNull(),
    gameMode: gameModeEnum('game_mode').default('RANKED_SOLO').notNull(),
    
    authorId: uuid('author_id').references(() => users.id).notNull(),
  })
  
  export const friendships = pgTable('friendships', {
    id: uuid('id').primaryKey().defaultRandom(),
    status: friendshipStatusEnum('status').default('PENDING').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    
    senderId: uuid('sender_id').references(() => users.id).notNull(),
    receiverId: uuid('receiver_id').references(() => users.id).notNull(),
  }, (table) => ({
    uniqueFriendship: unique().on(table.senderId, table.receiverId)
  }))
  
  export const messages = pgTable('messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    
    senderId: uuid('sender_id').references(() => users.id).notNull(),
    receiverId: uuid('receiver_id').references(() => users.id).notNull(),
  })
  
  export const likes = pgTable('likes', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    postId: uuid('post_id').references(() => posts.id).notNull(),
  }, (table) => ({
    uniqueLike: unique().on(table.userId, table.postId)
  }))
  
  export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
    sentMessages: many(messages, { relationName: 'messageSender' }),
    receivedMessages: many(messages, { relationName: 'messageReceiver' }),
    sentFriendships: many(friendships, { relationName: 'friendshipSender' }),
    receivedFriendships: many(friendships, { relationName: 'friendshipReceiver' }),
    likes: many(likes),
  }))
  
  export const postsRelations = relations(posts, ({ one, many }) => ({
    author: one(users, {
      fields: [posts.authorId],
      references: [users.id],
    }),
    likes: many(likes),
  }))
  
  export const friendshipsRelations = relations(friendships, ({ one }) => ({
    sender: one(users, {
      fields: [friendships.senderId],
      references: [users.id],
      relationName: 'friendshipSender',
    }),
    receiver: one(users, {
      fields: [friendships.receiverId],
      references: [users.id],
      relationName: 'friendshipReceiver',
    }),
  }))
  
  export const messagesRelations = relations(messages, ({ one }) => ({
    sender: one(users, {
      fields: [messages.senderId],
      references: [users.id],
      relationName: 'messageSender',
    }),
    receiver: one(users, {
      fields: [messages.receiverId],
      references: [users.id],
      relationName: 'messageReceiver',
    }),
  }))
  
  export const likesRelations = relations(likes, ({ one }) => ({
    user: one(users, {
      fields: [likes.userId],
      references: [users.id],
    }),
    post: one(posts, {
      fields: [likes.postId],
      references: [posts.id],
    }),
  }))
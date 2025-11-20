
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model admin_users
 * 
 */
export type admin_users = $Result.DefaultSelection<Prisma.$admin_usersPayload>
/**
 * Model bookings
 * 
 */
export type bookings = $Result.DefaultSelection<Prisma.$bookingsPayload>
/**
 * Model crowd_snapshots
 * 
 */
export type crowd_snapshots = $Result.DefaultSelection<Prisma.$crowd_snapshotsPayload>
/**
 * Model password_reset_tokens
 * 
 */
export type password_reset_tokens = $Result.DefaultSelection<Prisma.$password_reset_tokensPayload>
/**
 * Model peak_hour_patterns
 * 
 */
export type peak_hour_patterns = $Result.DefaultSelection<Prisma.$peak_hour_patternsPayload>
/**
 * Model prediction_cache
 * 
 */
export type prediction_cache = $Result.DefaultSelection<Prisma.$prediction_cachePayload>
/**
 * Model slots
 * 
 */
export type slots = $Result.DefaultSelection<Prisma.$slotsPayload>
/**
 * Model sos_alerts
 * 
 */
export type sos_alerts = $Result.DefaultSelection<Prisma.$sos_alertsPayload>
/**
 * Model user_bookings
 * 
 */
export type user_bookings = $Result.DefaultSelection<Prisma.$user_bookingsPayload>
/**
 * Model users
 * 
 */
export type users = $Result.DefaultSelection<Prisma.$usersPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserRole: {
  PILGRIM: 'PILGRIM',
  ADMIN: 'ADMIN'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

}

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Admin_users
 * const admin_users = await prisma.admin_users.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Admin_users
   * const admin_users = await prisma.admin_users.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.admin_users`: Exposes CRUD operations for the **admin_users** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Admin_users
    * const admin_users = await prisma.admin_users.findMany()
    * ```
    */
  get admin_users(): Prisma.admin_usersDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bookings`: Exposes CRUD operations for the **bookings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Bookings
    * const bookings = await prisma.bookings.findMany()
    * ```
    */
  get bookings(): Prisma.bookingsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.crowd_snapshots`: Exposes CRUD operations for the **crowd_snapshots** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Crowd_snapshots
    * const crowd_snapshots = await prisma.crowd_snapshots.findMany()
    * ```
    */
  get crowd_snapshots(): Prisma.crowd_snapshotsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.password_reset_tokens`: Exposes CRUD operations for the **password_reset_tokens** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Password_reset_tokens
    * const password_reset_tokens = await prisma.password_reset_tokens.findMany()
    * ```
    */
  get password_reset_tokens(): Prisma.password_reset_tokensDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.peak_hour_patterns`: Exposes CRUD operations for the **peak_hour_patterns** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Peak_hour_patterns
    * const peak_hour_patterns = await prisma.peak_hour_patterns.findMany()
    * ```
    */
  get peak_hour_patterns(): Prisma.peak_hour_patternsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.prediction_cache`: Exposes CRUD operations for the **prediction_cache** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Prediction_caches
    * const prediction_caches = await prisma.prediction_cache.findMany()
    * ```
    */
  get prediction_cache(): Prisma.prediction_cacheDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.slots`: Exposes CRUD operations for the **slots** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Slots
    * const slots = await prisma.slots.findMany()
    * ```
    */
  get slots(): Prisma.slotsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sos_alerts`: Exposes CRUD operations for the **sos_alerts** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sos_alerts
    * const sos_alerts = await prisma.sos_alerts.findMany()
    * ```
    */
  get sos_alerts(): Prisma.sos_alertsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user_bookings`: Exposes CRUD operations for the **user_bookings** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more User_bookings
    * const user_bookings = await prisma.user_bookings.findMany()
    * ```
    */
  get user_bookings(): Prisma.user_bookingsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.users`: Exposes CRUD operations for the **users** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.users.findMany()
    * ```
    */
  get users(): Prisma.usersDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.0
   * Query Engine version: 2ba551f319ab1df4bc874a89965d8b3641056773
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    admin_users: 'admin_users',
    bookings: 'bookings',
    crowd_snapshots: 'crowd_snapshots',
    password_reset_tokens: 'password_reset_tokens',
    peak_hour_patterns: 'peak_hour_patterns',
    prediction_cache: 'prediction_cache',
    slots: 'slots',
    sos_alerts: 'sos_alerts',
    user_bookings: 'user_bookings',
    users: 'users'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "admin_users" | "bookings" | "crowd_snapshots" | "password_reset_tokens" | "peak_hour_patterns" | "prediction_cache" | "slots" | "sos_alerts" | "user_bookings" | "users"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      admin_users: {
        payload: Prisma.$admin_usersPayload<ExtArgs>
        fields: Prisma.admin_usersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.admin_usersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$admin_usersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.admin_usersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$admin_usersPayload>
          }
          findFirst: {
            args: Prisma.admin_usersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$admin_usersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.admin_usersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$admin_usersPayload>
          }
          findMany: {
            args: Prisma.admin_usersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$admin_usersPayload>[]
          }
          create: {
            args: Prisma.admin_usersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$admin_usersPayload>
          }
          createMany: {
            args: Prisma.admin_usersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.admin_usersCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$admin_usersPayload>[]
          }
          delete: {
            args: Prisma.admin_usersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$admin_usersPayload>
          }
          update: {
            args: Prisma.admin_usersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$admin_usersPayload>
          }
          deleteMany: {
            args: Prisma.admin_usersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.admin_usersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.admin_usersUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$admin_usersPayload>[]
          }
          upsert: {
            args: Prisma.admin_usersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$admin_usersPayload>
          }
          aggregate: {
            args: Prisma.Admin_usersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAdmin_users>
          }
          groupBy: {
            args: Prisma.admin_usersGroupByArgs<ExtArgs>
            result: $Utils.Optional<Admin_usersGroupByOutputType>[]
          }
          count: {
            args: Prisma.admin_usersCountArgs<ExtArgs>
            result: $Utils.Optional<Admin_usersCountAggregateOutputType> | number
          }
        }
      }
      bookings: {
        payload: Prisma.$bookingsPayload<ExtArgs>
        fields: Prisma.bookingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.bookingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bookingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.bookingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bookingsPayload>
          }
          findFirst: {
            args: Prisma.bookingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bookingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.bookingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bookingsPayload>
          }
          findMany: {
            args: Prisma.bookingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bookingsPayload>[]
          }
          create: {
            args: Prisma.bookingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bookingsPayload>
          }
          createMany: {
            args: Prisma.bookingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.bookingsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bookingsPayload>[]
          }
          delete: {
            args: Prisma.bookingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bookingsPayload>
          }
          update: {
            args: Prisma.bookingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bookingsPayload>
          }
          deleteMany: {
            args: Prisma.bookingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.bookingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.bookingsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bookingsPayload>[]
          }
          upsert: {
            args: Prisma.bookingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$bookingsPayload>
          }
          aggregate: {
            args: Prisma.BookingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBookings>
          }
          groupBy: {
            args: Prisma.bookingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<BookingsGroupByOutputType>[]
          }
          count: {
            args: Prisma.bookingsCountArgs<ExtArgs>
            result: $Utils.Optional<BookingsCountAggregateOutputType> | number
          }
        }
      }
      crowd_snapshots: {
        payload: Prisma.$crowd_snapshotsPayload<ExtArgs>
        fields: Prisma.crowd_snapshotsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.crowd_snapshotsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$crowd_snapshotsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.crowd_snapshotsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$crowd_snapshotsPayload>
          }
          findFirst: {
            args: Prisma.crowd_snapshotsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$crowd_snapshotsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.crowd_snapshotsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$crowd_snapshotsPayload>
          }
          findMany: {
            args: Prisma.crowd_snapshotsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$crowd_snapshotsPayload>[]
          }
          create: {
            args: Prisma.crowd_snapshotsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$crowd_snapshotsPayload>
          }
          createMany: {
            args: Prisma.crowd_snapshotsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.crowd_snapshotsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$crowd_snapshotsPayload>[]
          }
          delete: {
            args: Prisma.crowd_snapshotsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$crowd_snapshotsPayload>
          }
          update: {
            args: Prisma.crowd_snapshotsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$crowd_snapshotsPayload>
          }
          deleteMany: {
            args: Prisma.crowd_snapshotsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.crowd_snapshotsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.crowd_snapshotsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$crowd_snapshotsPayload>[]
          }
          upsert: {
            args: Prisma.crowd_snapshotsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$crowd_snapshotsPayload>
          }
          aggregate: {
            args: Prisma.Crowd_snapshotsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCrowd_snapshots>
          }
          groupBy: {
            args: Prisma.crowd_snapshotsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Crowd_snapshotsGroupByOutputType>[]
          }
          count: {
            args: Prisma.crowd_snapshotsCountArgs<ExtArgs>
            result: $Utils.Optional<Crowd_snapshotsCountAggregateOutputType> | number
          }
        }
      }
      password_reset_tokens: {
        payload: Prisma.$password_reset_tokensPayload<ExtArgs>
        fields: Prisma.password_reset_tokensFieldRefs
        operations: {
          findUnique: {
            args: Prisma.password_reset_tokensFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$password_reset_tokensPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.password_reset_tokensFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$password_reset_tokensPayload>
          }
          findFirst: {
            args: Prisma.password_reset_tokensFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$password_reset_tokensPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.password_reset_tokensFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$password_reset_tokensPayload>
          }
          findMany: {
            args: Prisma.password_reset_tokensFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$password_reset_tokensPayload>[]
          }
          create: {
            args: Prisma.password_reset_tokensCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$password_reset_tokensPayload>
          }
          createMany: {
            args: Prisma.password_reset_tokensCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.password_reset_tokensCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$password_reset_tokensPayload>[]
          }
          delete: {
            args: Prisma.password_reset_tokensDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$password_reset_tokensPayload>
          }
          update: {
            args: Prisma.password_reset_tokensUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$password_reset_tokensPayload>
          }
          deleteMany: {
            args: Prisma.password_reset_tokensDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.password_reset_tokensUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.password_reset_tokensUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$password_reset_tokensPayload>[]
          }
          upsert: {
            args: Prisma.password_reset_tokensUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$password_reset_tokensPayload>
          }
          aggregate: {
            args: Prisma.Password_reset_tokensAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePassword_reset_tokens>
          }
          groupBy: {
            args: Prisma.password_reset_tokensGroupByArgs<ExtArgs>
            result: $Utils.Optional<Password_reset_tokensGroupByOutputType>[]
          }
          count: {
            args: Prisma.password_reset_tokensCountArgs<ExtArgs>
            result: $Utils.Optional<Password_reset_tokensCountAggregateOutputType> | number
          }
        }
      }
      peak_hour_patterns: {
        payload: Prisma.$peak_hour_patternsPayload<ExtArgs>
        fields: Prisma.peak_hour_patternsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.peak_hour_patternsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peak_hour_patternsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.peak_hour_patternsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peak_hour_patternsPayload>
          }
          findFirst: {
            args: Prisma.peak_hour_patternsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peak_hour_patternsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.peak_hour_patternsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peak_hour_patternsPayload>
          }
          findMany: {
            args: Prisma.peak_hour_patternsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peak_hour_patternsPayload>[]
          }
          create: {
            args: Prisma.peak_hour_patternsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peak_hour_patternsPayload>
          }
          createMany: {
            args: Prisma.peak_hour_patternsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.peak_hour_patternsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peak_hour_patternsPayload>[]
          }
          delete: {
            args: Prisma.peak_hour_patternsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peak_hour_patternsPayload>
          }
          update: {
            args: Prisma.peak_hour_patternsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peak_hour_patternsPayload>
          }
          deleteMany: {
            args: Prisma.peak_hour_patternsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.peak_hour_patternsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.peak_hour_patternsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peak_hour_patternsPayload>[]
          }
          upsert: {
            args: Prisma.peak_hour_patternsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$peak_hour_patternsPayload>
          }
          aggregate: {
            args: Prisma.Peak_hour_patternsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePeak_hour_patterns>
          }
          groupBy: {
            args: Prisma.peak_hour_patternsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Peak_hour_patternsGroupByOutputType>[]
          }
          count: {
            args: Prisma.peak_hour_patternsCountArgs<ExtArgs>
            result: $Utils.Optional<Peak_hour_patternsCountAggregateOutputType> | number
          }
        }
      }
      prediction_cache: {
        payload: Prisma.$prediction_cachePayload<ExtArgs>
        fields: Prisma.prediction_cacheFieldRefs
        operations: {
          findUnique: {
            args: Prisma.prediction_cacheFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$prediction_cachePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.prediction_cacheFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$prediction_cachePayload>
          }
          findFirst: {
            args: Prisma.prediction_cacheFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$prediction_cachePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.prediction_cacheFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$prediction_cachePayload>
          }
          findMany: {
            args: Prisma.prediction_cacheFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$prediction_cachePayload>[]
          }
          create: {
            args: Prisma.prediction_cacheCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$prediction_cachePayload>
          }
          createMany: {
            args: Prisma.prediction_cacheCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.prediction_cacheCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$prediction_cachePayload>[]
          }
          delete: {
            args: Prisma.prediction_cacheDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$prediction_cachePayload>
          }
          update: {
            args: Prisma.prediction_cacheUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$prediction_cachePayload>
          }
          deleteMany: {
            args: Prisma.prediction_cacheDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.prediction_cacheUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.prediction_cacheUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$prediction_cachePayload>[]
          }
          upsert: {
            args: Prisma.prediction_cacheUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$prediction_cachePayload>
          }
          aggregate: {
            args: Prisma.Prediction_cacheAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePrediction_cache>
          }
          groupBy: {
            args: Prisma.prediction_cacheGroupByArgs<ExtArgs>
            result: $Utils.Optional<Prediction_cacheGroupByOutputType>[]
          }
          count: {
            args: Prisma.prediction_cacheCountArgs<ExtArgs>
            result: $Utils.Optional<Prediction_cacheCountAggregateOutputType> | number
          }
        }
      }
      slots: {
        payload: Prisma.$slotsPayload<ExtArgs>
        fields: Prisma.slotsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.slotsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$slotsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.slotsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$slotsPayload>
          }
          findFirst: {
            args: Prisma.slotsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$slotsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.slotsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$slotsPayload>
          }
          findMany: {
            args: Prisma.slotsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$slotsPayload>[]
          }
          create: {
            args: Prisma.slotsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$slotsPayload>
          }
          createMany: {
            args: Prisma.slotsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.slotsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$slotsPayload>[]
          }
          delete: {
            args: Prisma.slotsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$slotsPayload>
          }
          update: {
            args: Prisma.slotsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$slotsPayload>
          }
          deleteMany: {
            args: Prisma.slotsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.slotsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.slotsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$slotsPayload>[]
          }
          upsert: {
            args: Prisma.slotsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$slotsPayload>
          }
          aggregate: {
            args: Prisma.SlotsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSlots>
          }
          groupBy: {
            args: Prisma.slotsGroupByArgs<ExtArgs>
            result: $Utils.Optional<SlotsGroupByOutputType>[]
          }
          count: {
            args: Prisma.slotsCountArgs<ExtArgs>
            result: $Utils.Optional<SlotsCountAggregateOutputType> | number
          }
        }
      }
      sos_alerts: {
        payload: Prisma.$sos_alertsPayload<ExtArgs>
        fields: Prisma.sos_alertsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.sos_alertsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sos_alertsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.sos_alertsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sos_alertsPayload>
          }
          findFirst: {
            args: Prisma.sos_alertsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sos_alertsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.sos_alertsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sos_alertsPayload>
          }
          findMany: {
            args: Prisma.sos_alertsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sos_alertsPayload>[]
          }
          create: {
            args: Prisma.sos_alertsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sos_alertsPayload>
          }
          createMany: {
            args: Prisma.sos_alertsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.sos_alertsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sos_alertsPayload>[]
          }
          delete: {
            args: Prisma.sos_alertsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sos_alertsPayload>
          }
          update: {
            args: Prisma.sos_alertsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sos_alertsPayload>
          }
          deleteMany: {
            args: Prisma.sos_alertsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.sos_alertsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.sos_alertsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sos_alertsPayload>[]
          }
          upsert: {
            args: Prisma.sos_alertsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sos_alertsPayload>
          }
          aggregate: {
            args: Prisma.Sos_alertsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSos_alerts>
          }
          groupBy: {
            args: Prisma.sos_alertsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Sos_alertsGroupByOutputType>[]
          }
          count: {
            args: Prisma.sos_alertsCountArgs<ExtArgs>
            result: $Utils.Optional<Sos_alertsCountAggregateOutputType> | number
          }
        }
      }
      user_bookings: {
        payload: Prisma.$user_bookingsPayload<ExtArgs>
        fields: Prisma.user_bookingsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.user_bookingsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_bookingsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.user_bookingsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_bookingsPayload>
          }
          findFirst: {
            args: Prisma.user_bookingsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_bookingsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.user_bookingsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_bookingsPayload>
          }
          findMany: {
            args: Prisma.user_bookingsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_bookingsPayload>[]
          }
          create: {
            args: Prisma.user_bookingsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_bookingsPayload>
          }
          createMany: {
            args: Prisma.user_bookingsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.user_bookingsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_bookingsPayload>[]
          }
          delete: {
            args: Prisma.user_bookingsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_bookingsPayload>
          }
          update: {
            args: Prisma.user_bookingsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_bookingsPayload>
          }
          deleteMany: {
            args: Prisma.user_bookingsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.user_bookingsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.user_bookingsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_bookingsPayload>[]
          }
          upsert: {
            args: Prisma.user_bookingsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$user_bookingsPayload>
          }
          aggregate: {
            args: Prisma.User_bookingsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser_bookings>
          }
          groupBy: {
            args: Prisma.user_bookingsGroupByArgs<ExtArgs>
            result: $Utils.Optional<User_bookingsGroupByOutputType>[]
          }
          count: {
            args: Prisma.user_bookingsCountArgs<ExtArgs>
            result: $Utils.Optional<User_bookingsCountAggregateOutputType> | number
          }
        }
      }
      users: {
        payload: Prisma.$usersPayload<ExtArgs>
        fields: Prisma.usersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.usersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.usersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          findFirst: {
            args: Prisma.usersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.usersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          findMany: {
            args: Prisma.usersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>[]
          }
          create: {
            args: Prisma.usersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          createMany: {
            args: Prisma.usersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.usersCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>[]
          }
          delete: {
            args: Prisma.usersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          update: {
            args: Prisma.usersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          deleteMany: {
            args: Prisma.usersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.usersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.usersUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>[]
          }
          upsert: {
            args: Prisma.usersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          aggregate: {
            args: Prisma.UsersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsers>
          }
          groupBy: {
            args: Prisma.usersGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsersGroupByOutputType>[]
          }
          count: {
            args: Prisma.usersCountArgs<ExtArgs>
            result: $Utils.Optional<UsersCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    admin_users?: admin_usersOmit
    bookings?: bookingsOmit
    crowd_snapshots?: crowd_snapshotsOmit
    password_reset_tokens?: password_reset_tokensOmit
    peak_hour_patterns?: peak_hour_patternsOmit
    prediction_cache?: prediction_cacheOmit
    slots?: slotsOmit
    sos_alerts?: sos_alertsOmit
    user_bookings?: user_bookingsOmit
    users?: usersOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type SlotsCountOutputType
   */

  export type SlotsCountOutputType = {
    bookings: number
    user_bookings: number
  }

  export type SlotsCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | SlotsCountOutputTypeCountBookingsArgs
    user_bookings?: boolean | SlotsCountOutputTypeCountUser_bookingsArgs
  }

  // Custom InputTypes
  /**
   * SlotsCountOutputType without action
   */
  export type SlotsCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlotsCountOutputType
     */
    select?: SlotsCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SlotsCountOutputType without action
   */
  export type SlotsCountOutputTypeCountBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: bookingsWhereInput
  }

  /**
   * SlotsCountOutputType without action
   */
  export type SlotsCountOutputTypeCountUser_bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: user_bookingsWhereInput
  }


  /**
   * Count Type UsersCountOutputType
   */

  export type UsersCountOutputType = {
    password_reset_tokens: number
    sos_alerts: number
    user_bookings: number
  }

  export type UsersCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    password_reset_tokens?: boolean | UsersCountOutputTypeCountPassword_reset_tokensArgs
    sos_alerts?: boolean | UsersCountOutputTypeCountSos_alertsArgs
    user_bookings?: boolean | UsersCountOutputTypeCountUser_bookingsArgs
  }

  // Custom InputTypes
  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsersCountOutputType
     */
    select?: UsersCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeCountPassword_reset_tokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: password_reset_tokensWhereInput
  }

  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeCountSos_alertsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: sos_alertsWhereInput
  }

  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeCountUser_bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: user_bookingsWhereInput
  }


  /**
   * Models
   */

  /**
   * Model admin_users
   */

  export type AggregateAdmin_users = {
    _count: Admin_usersCountAggregateOutputType | null
    _min: Admin_usersMinAggregateOutputType | null
    _max: Admin_usersMaxAggregateOutputType | null
  }

  export type Admin_usersMinAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    role: string | null
    createdAt: Date | null
  }

  export type Admin_usersMaxAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    role: string | null
    createdAt: Date | null
  }

  export type Admin_usersCountAggregateOutputType = {
    id: number
    email: number
    passwordHash: number
    role: number
    createdAt: number
    _all: number
  }


  export type Admin_usersMinAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    role?: true
    createdAt?: true
  }

  export type Admin_usersMaxAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    role?: true
    createdAt?: true
  }

  export type Admin_usersCountAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    role?: true
    createdAt?: true
    _all?: true
  }

  export type Admin_usersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which admin_users to aggregate.
     */
    where?: admin_usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of admin_users to fetch.
     */
    orderBy?: admin_usersOrderByWithRelationInput | admin_usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: admin_usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` admin_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` admin_users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned admin_users
    **/
    _count?: true | Admin_usersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Admin_usersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Admin_usersMaxAggregateInputType
  }

  export type GetAdmin_usersAggregateType<T extends Admin_usersAggregateArgs> = {
        [P in keyof T & keyof AggregateAdmin_users]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAdmin_users[P]>
      : GetScalarType<T[P], AggregateAdmin_users[P]>
  }




  export type admin_usersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: admin_usersWhereInput
    orderBy?: admin_usersOrderByWithAggregationInput | admin_usersOrderByWithAggregationInput[]
    by: Admin_usersScalarFieldEnum[] | Admin_usersScalarFieldEnum
    having?: admin_usersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Admin_usersCountAggregateInputType | true
    _min?: Admin_usersMinAggregateInputType
    _max?: Admin_usersMaxAggregateInputType
  }

  export type Admin_usersGroupByOutputType = {
    id: string
    email: string
    passwordHash: string
    role: string
    createdAt: Date
    _count: Admin_usersCountAggregateOutputType | null
    _min: Admin_usersMinAggregateOutputType | null
    _max: Admin_usersMaxAggregateOutputType | null
  }

  type GetAdmin_usersGroupByPayload<T extends admin_usersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Admin_usersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Admin_usersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Admin_usersGroupByOutputType[P]>
            : GetScalarType<T[P], Admin_usersGroupByOutputType[P]>
        }
      >
    >


  export type admin_usersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["admin_users"]>

  export type admin_usersSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["admin_users"]>

  export type admin_usersSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["admin_users"]>

  export type admin_usersSelectScalar = {
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    createdAt?: boolean
  }

  export type admin_usersOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "passwordHash" | "role" | "createdAt", ExtArgs["result"]["admin_users"]>

  export type $admin_usersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "admin_users"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      passwordHash: string
      role: string
      createdAt: Date
    }, ExtArgs["result"]["admin_users"]>
    composites: {}
  }

  type admin_usersGetPayload<S extends boolean | null | undefined | admin_usersDefaultArgs> = $Result.GetResult<Prisma.$admin_usersPayload, S>

  type admin_usersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<admin_usersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Admin_usersCountAggregateInputType | true
    }

  export interface admin_usersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['admin_users'], meta: { name: 'admin_users' } }
    /**
     * Find zero or one Admin_users that matches the filter.
     * @param {admin_usersFindUniqueArgs} args - Arguments to find a Admin_users
     * @example
     * // Get one Admin_users
     * const admin_users = await prisma.admin_users.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends admin_usersFindUniqueArgs>(args: SelectSubset<T, admin_usersFindUniqueArgs<ExtArgs>>): Prisma__admin_usersClient<$Result.GetResult<Prisma.$admin_usersPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Admin_users that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {admin_usersFindUniqueOrThrowArgs} args - Arguments to find a Admin_users
     * @example
     * // Get one Admin_users
     * const admin_users = await prisma.admin_users.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends admin_usersFindUniqueOrThrowArgs>(args: SelectSubset<T, admin_usersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__admin_usersClient<$Result.GetResult<Prisma.$admin_usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Admin_users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {admin_usersFindFirstArgs} args - Arguments to find a Admin_users
     * @example
     * // Get one Admin_users
     * const admin_users = await prisma.admin_users.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends admin_usersFindFirstArgs>(args?: SelectSubset<T, admin_usersFindFirstArgs<ExtArgs>>): Prisma__admin_usersClient<$Result.GetResult<Prisma.$admin_usersPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Admin_users that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {admin_usersFindFirstOrThrowArgs} args - Arguments to find a Admin_users
     * @example
     * // Get one Admin_users
     * const admin_users = await prisma.admin_users.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends admin_usersFindFirstOrThrowArgs>(args?: SelectSubset<T, admin_usersFindFirstOrThrowArgs<ExtArgs>>): Prisma__admin_usersClient<$Result.GetResult<Prisma.$admin_usersPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Admin_users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {admin_usersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Admin_users
     * const admin_users = await prisma.admin_users.findMany()
     * 
     * // Get first 10 Admin_users
     * const admin_users = await prisma.admin_users.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const admin_usersWithIdOnly = await prisma.admin_users.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends admin_usersFindManyArgs>(args?: SelectSubset<T, admin_usersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$admin_usersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Admin_users.
     * @param {admin_usersCreateArgs} args - Arguments to create a Admin_users.
     * @example
     * // Create one Admin_users
     * const Admin_users = await prisma.admin_users.create({
     *   data: {
     *     // ... data to create a Admin_users
     *   }
     * })
     * 
     */
    create<T extends admin_usersCreateArgs>(args: SelectSubset<T, admin_usersCreateArgs<ExtArgs>>): Prisma__admin_usersClient<$Result.GetResult<Prisma.$admin_usersPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Admin_users.
     * @param {admin_usersCreateManyArgs} args - Arguments to create many Admin_users.
     * @example
     * // Create many Admin_users
     * const admin_users = await prisma.admin_users.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends admin_usersCreateManyArgs>(args?: SelectSubset<T, admin_usersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Admin_users and returns the data saved in the database.
     * @param {admin_usersCreateManyAndReturnArgs} args - Arguments to create many Admin_users.
     * @example
     * // Create many Admin_users
     * const admin_users = await prisma.admin_users.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Admin_users and only return the `id`
     * const admin_usersWithIdOnly = await prisma.admin_users.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends admin_usersCreateManyAndReturnArgs>(args?: SelectSubset<T, admin_usersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$admin_usersPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Admin_users.
     * @param {admin_usersDeleteArgs} args - Arguments to delete one Admin_users.
     * @example
     * // Delete one Admin_users
     * const Admin_users = await prisma.admin_users.delete({
     *   where: {
     *     // ... filter to delete one Admin_users
     *   }
     * })
     * 
     */
    delete<T extends admin_usersDeleteArgs>(args: SelectSubset<T, admin_usersDeleteArgs<ExtArgs>>): Prisma__admin_usersClient<$Result.GetResult<Prisma.$admin_usersPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Admin_users.
     * @param {admin_usersUpdateArgs} args - Arguments to update one Admin_users.
     * @example
     * // Update one Admin_users
     * const admin_users = await prisma.admin_users.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends admin_usersUpdateArgs>(args: SelectSubset<T, admin_usersUpdateArgs<ExtArgs>>): Prisma__admin_usersClient<$Result.GetResult<Prisma.$admin_usersPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Admin_users.
     * @param {admin_usersDeleteManyArgs} args - Arguments to filter Admin_users to delete.
     * @example
     * // Delete a few Admin_users
     * const { count } = await prisma.admin_users.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends admin_usersDeleteManyArgs>(args?: SelectSubset<T, admin_usersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Admin_users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {admin_usersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Admin_users
     * const admin_users = await prisma.admin_users.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends admin_usersUpdateManyArgs>(args: SelectSubset<T, admin_usersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Admin_users and returns the data updated in the database.
     * @param {admin_usersUpdateManyAndReturnArgs} args - Arguments to update many Admin_users.
     * @example
     * // Update many Admin_users
     * const admin_users = await prisma.admin_users.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Admin_users and only return the `id`
     * const admin_usersWithIdOnly = await prisma.admin_users.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends admin_usersUpdateManyAndReturnArgs>(args: SelectSubset<T, admin_usersUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$admin_usersPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Admin_users.
     * @param {admin_usersUpsertArgs} args - Arguments to update or create a Admin_users.
     * @example
     * // Update or create a Admin_users
     * const admin_users = await prisma.admin_users.upsert({
     *   create: {
     *     // ... data to create a Admin_users
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Admin_users we want to update
     *   }
     * })
     */
    upsert<T extends admin_usersUpsertArgs>(args: SelectSubset<T, admin_usersUpsertArgs<ExtArgs>>): Prisma__admin_usersClient<$Result.GetResult<Prisma.$admin_usersPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Admin_users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {admin_usersCountArgs} args - Arguments to filter Admin_users to count.
     * @example
     * // Count the number of Admin_users
     * const count = await prisma.admin_users.count({
     *   where: {
     *     // ... the filter for the Admin_users we want to count
     *   }
     * })
    **/
    count<T extends admin_usersCountArgs>(
      args?: Subset<T, admin_usersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Admin_usersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Admin_users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Admin_usersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Admin_usersAggregateArgs>(args: Subset<T, Admin_usersAggregateArgs>): Prisma.PrismaPromise<GetAdmin_usersAggregateType<T>>

    /**
     * Group by Admin_users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {admin_usersGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends admin_usersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: admin_usersGroupByArgs['orderBy'] }
        : { orderBy?: admin_usersGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, admin_usersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAdmin_usersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the admin_users model
   */
  readonly fields: admin_usersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for admin_users.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__admin_usersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the admin_users model
   */
  interface admin_usersFieldRefs {
    readonly id: FieldRef<"admin_users", 'String'>
    readonly email: FieldRef<"admin_users", 'String'>
    readonly passwordHash: FieldRef<"admin_users", 'String'>
    readonly role: FieldRef<"admin_users", 'String'>
    readonly createdAt: FieldRef<"admin_users", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * admin_users findUnique
   */
  export type admin_usersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admin_users
     */
    select?: admin_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the admin_users
     */
    omit?: admin_usersOmit<ExtArgs> | null
    /**
     * Filter, which admin_users to fetch.
     */
    where: admin_usersWhereUniqueInput
  }

  /**
   * admin_users findUniqueOrThrow
   */
  export type admin_usersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admin_users
     */
    select?: admin_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the admin_users
     */
    omit?: admin_usersOmit<ExtArgs> | null
    /**
     * Filter, which admin_users to fetch.
     */
    where: admin_usersWhereUniqueInput
  }

  /**
   * admin_users findFirst
   */
  export type admin_usersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admin_users
     */
    select?: admin_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the admin_users
     */
    omit?: admin_usersOmit<ExtArgs> | null
    /**
     * Filter, which admin_users to fetch.
     */
    where?: admin_usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of admin_users to fetch.
     */
    orderBy?: admin_usersOrderByWithRelationInput | admin_usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for admin_users.
     */
    cursor?: admin_usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` admin_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` admin_users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of admin_users.
     */
    distinct?: Admin_usersScalarFieldEnum | Admin_usersScalarFieldEnum[]
  }

  /**
   * admin_users findFirstOrThrow
   */
  export type admin_usersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admin_users
     */
    select?: admin_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the admin_users
     */
    omit?: admin_usersOmit<ExtArgs> | null
    /**
     * Filter, which admin_users to fetch.
     */
    where?: admin_usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of admin_users to fetch.
     */
    orderBy?: admin_usersOrderByWithRelationInput | admin_usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for admin_users.
     */
    cursor?: admin_usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` admin_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` admin_users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of admin_users.
     */
    distinct?: Admin_usersScalarFieldEnum | Admin_usersScalarFieldEnum[]
  }

  /**
   * admin_users findMany
   */
  export type admin_usersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admin_users
     */
    select?: admin_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the admin_users
     */
    omit?: admin_usersOmit<ExtArgs> | null
    /**
     * Filter, which admin_users to fetch.
     */
    where?: admin_usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of admin_users to fetch.
     */
    orderBy?: admin_usersOrderByWithRelationInput | admin_usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing admin_users.
     */
    cursor?: admin_usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` admin_users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` admin_users.
     */
    skip?: number
    distinct?: Admin_usersScalarFieldEnum | Admin_usersScalarFieldEnum[]
  }

  /**
   * admin_users create
   */
  export type admin_usersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admin_users
     */
    select?: admin_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the admin_users
     */
    omit?: admin_usersOmit<ExtArgs> | null
    /**
     * The data needed to create a admin_users.
     */
    data: XOR<admin_usersCreateInput, admin_usersUncheckedCreateInput>
  }

  /**
   * admin_users createMany
   */
  export type admin_usersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many admin_users.
     */
    data: admin_usersCreateManyInput | admin_usersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * admin_users createManyAndReturn
   */
  export type admin_usersCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admin_users
     */
    select?: admin_usersSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the admin_users
     */
    omit?: admin_usersOmit<ExtArgs> | null
    /**
     * The data used to create many admin_users.
     */
    data: admin_usersCreateManyInput | admin_usersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * admin_users update
   */
  export type admin_usersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admin_users
     */
    select?: admin_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the admin_users
     */
    omit?: admin_usersOmit<ExtArgs> | null
    /**
     * The data needed to update a admin_users.
     */
    data: XOR<admin_usersUpdateInput, admin_usersUncheckedUpdateInput>
    /**
     * Choose, which admin_users to update.
     */
    where: admin_usersWhereUniqueInput
  }

  /**
   * admin_users updateMany
   */
  export type admin_usersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update admin_users.
     */
    data: XOR<admin_usersUpdateManyMutationInput, admin_usersUncheckedUpdateManyInput>
    /**
     * Filter which admin_users to update
     */
    where?: admin_usersWhereInput
    /**
     * Limit how many admin_users to update.
     */
    limit?: number
  }

  /**
   * admin_users updateManyAndReturn
   */
  export type admin_usersUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admin_users
     */
    select?: admin_usersSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the admin_users
     */
    omit?: admin_usersOmit<ExtArgs> | null
    /**
     * The data used to update admin_users.
     */
    data: XOR<admin_usersUpdateManyMutationInput, admin_usersUncheckedUpdateManyInput>
    /**
     * Filter which admin_users to update
     */
    where?: admin_usersWhereInput
    /**
     * Limit how many admin_users to update.
     */
    limit?: number
  }

  /**
   * admin_users upsert
   */
  export type admin_usersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admin_users
     */
    select?: admin_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the admin_users
     */
    omit?: admin_usersOmit<ExtArgs> | null
    /**
     * The filter to search for the admin_users to update in case it exists.
     */
    where: admin_usersWhereUniqueInput
    /**
     * In case the admin_users found by the `where` argument doesn't exist, create a new admin_users with this data.
     */
    create: XOR<admin_usersCreateInput, admin_usersUncheckedCreateInput>
    /**
     * In case the admin_users was found with the provided `where` argument, update it with this data.
     */
    update: XOR<admin_usersUpdateInput, admin_usersUncheckedUpdateInput>
  }

  /**
   * admin_users delete
   */
  export type admin_usersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admin_users
     */
    select?: admin_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the admin_users
     */
    omit?: admin_usersOmit<ExtArgs> | null
    /**
     * Filter which admin_users to delete.
     */
    where: admin_usersWhereUniqueInput
  }

  /**
   * admin_users deleteMany
   */
  export type admin_usersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which admin_users to delete
     */
    where?: admin_usersWhereInput
    /**
     * Limit how many admin_users to delete.
     */
    limit?: number
  }

  /**
   * admin_users without action
   */
  export type admin_usersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the admin_users
     */
    select?: admin_usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the admin_users
     */
    omit?: admin_usersOmit<ExtArgs> | null
  }


  /**
   * Model bookings
   */

  export type AggregateBookings = {
    _count: BookingsCountAggregateOutputType | null
    _avg: BookingsAvgAggregateOutputType | null
    _sum: BookingsSumAggregateOutputType | null
    _min: BookingsMinAggregateOutputType | null
    _max: BookingsMaxAggregateOutputType | null
  }

  export type BookingsAvgAggregateOutputType = {
    numberOfPeople: number | null
  }

  export type BookingsSumAggregateOutputType = {
    numberOfPeople: number | null
  }

  export type BookingsMinAggregateOutputType = {
    id: string | null
    slotId: string | null
    name: string | null
    phone: string | null
    email: string | null
    numberOfPeople: number | null
    qrCode: string | null
    status: string | null
    checkedInAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BookingsMaxAggregateOutputType = {
    id: string | null
    slotId: string | null
    name: string | null
    phone: string | null
    email: string | null
    numberOfPeople: number | null
    qrCode: string | null
    status: string | null
    checkedInAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BookingsCountAggregateOutputType = {
    id: number
    slotId: number
    name: number
    phone: number
    email: number
    numberOfPeople: number
    qrCode: number
    status: number
    checkedInAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BookingsAvgAggregateInputType = {
    numberOfPeople?: true
  }

  export type BookingsSumAggregateInputType = {
    numberOfPeople?: true
  }

  export type BookingsMinAggregateInputType = {
    id?: true
    slotId?: true
    name?: true
    phone?: true
    email?: true
    numberOfPeople?: true
    qrCode?: true
    status?: true
    checkedInAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BookingsMaxAggregateInputType = {
    id?: true
    slotId?: true
    name?: true
    phone?: true
    email?: true
    numberOfPeople?: true
    qrCode?: true
    status?: true
    checkedInAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BookingsCountAggregateInputType = {
    id?: true
    slotId?: true
    name?: true
    phone?: true
    email?: true
    numberOfPeople?: true
    qrCode?: true
    status?: true
    checkedInAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BookingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which bookings to aggregate.
     */
    where?: bookingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of bookings to fetch.
     */
    orderBy?: bookingsOrderByWithRelationInput | bookingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: bookingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned bookings
    **/
    _count?: true | BookingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BookingsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BookingsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BookingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BookingsMaxAggregateInputType
  }

  export type GetBookingsAggregateType<T extends BookingsAggregateArgs> = {
        [P in keyof T & keyof AggregateBookings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBookings[P]>
      : GetScalarType<T[P], AggregateBookings[P]>
  }




  export type bookingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: bookingsWhereInput
    orderBy?: bookingsOrderByWithAggregationInput | bookingsOrderByWithAggregationInput[]
    by: BookingsScalarFieldEnum[] | BookingsScalarFieldEnum
    having?: bookingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BookingsCountAggregateInputType | true
    _avg?: BookingsAvgAggregateInputType
    _sum?: BookingsSumAggregateInputType
    _min?: BookingsMinAggregateInputType
    _max?: BookingsMaxAggregateInputType
  }

  export type BookingsGroupByOutputType = {
    id: string
    slotId: string
    name: string
    phone: string
    email: string
    numberOfPeople: number
    qrCode: string
    status: string
    checkedInAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: BookingsCountAggregateOutputType | null
    _avg: BookingsAvgAggregateOutputType | null
    _sum: BookingsSumAggregateOutputType | null
    _min: BookingsMinAggregateOutputType | null
    _max: BookingsMaxAggregateOutputType | null
  }

  type GetBookingsGroupByPayload<T extends bookingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BookingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BookingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BookingsGroupByOutputType[P]>
            : GetScalarType<T[P], BookingsGroupByOutputType[P]>
        }
      >
    >


  export type bookingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slotId?: boolean
    name?: boolean
    phone?: boolean
    email?: boolean
    numberOfPeople?: boolean
    qrCode?: boolean
    status?: boolean
    checkedInAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    slots?: boolean | slotsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bookings"]>

  export type bookingsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slotId?: boolean
    name?: boolean
    phone?: boolean
    email?: boolean
    numberOfPeople?: boolean
    qrCode?: boolean
    status?: boolean
    checkedInAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    slots?: boolean | slotsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bookings"]>

  export type bookingsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    slotId?: boolean
    name?: boolean
    phone?: boolean
    email?: boolean
    numberOfPeople?: boolean
    qrCode?: boolean
    status?: boolean
    checkedInAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    slots?: boolean | slotsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bookings"]>

  export type bookingsSelectScalar = {
    id?: boolean
    slotId?: boolean
    name?: boolean
    phone?: boolean
    email?: boolean
    numberOfPeople?: boolean
    qrCode?: boolean
    status?: boolean
    checkedInAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type bookingsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "slotId" | "name" | "phone" | "email" | "numberOfPeople" | "qrCode" | "status" | "checkedInAt" | "createdAt" | "updatedAt", ExtArgs["result"]["bookings"]>
  export type bookingsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    slots?: boolean | slotsDefaultArgs<ExtArgs>
  }
  export type bookingsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    slots?: boolean | slotsDefaultArgs<ExtArgs>
  }
  export type bookingsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    slots?: boolean | slotsDefaultArgs<ExtArgs>
  }

  export type $bookingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "bookings"
    objects: {
      slots: Prisma.$slotsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      slotId: string
      name: string
      phone: string
      email: string
      numberOfPeople: number
      qrCode: string
      status: string
      checkedInAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["bookings"]>
    composites: {}
  }

  type bookingsGetPayload<S extends boolean | null | undefined | bookingsDefaultArgs> = $Result.GetResult<Prisma.$bookingsPayload, S>

  type bookingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<bookingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BookingsCountAggregateInputType | true
    }

  export interface bookingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['bookings'], meta: { name: 'bookings' } }
    /**
     * Find zero or one Bookings that matches the filter.
     * @param {bookingsFindUniqueArgs} args - Arguments to find a Bookings
     * @example
     * // Get one Bookings
     * const bookings = await prisma.bookings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends bookingsFindUniqueArgs>(args: SelectSubset<T, bookingsFindUniqueArgs<ExtArgs>>): Prisma__bookingsClient<$Result.GetResult<Prisma.$bookingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Bookings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {bookingsFindUniqueOrThrowArgs} args - Arguments to find a Bookings
     * @example
     * // Get one Bookings
     * const bookings = await prisma.bookings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends bookingsFindUniqueOrThrowArgs>(args: SelectSubset<T, bookingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__bookingsClient<$Result.GetResult<Prisma.$bookingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bookings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {bookingsFindFirstArgs} args - Arguments to find a Bookings
     * @example
     * // Get one Bookings
     * const bookings = await prisma.bookings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends bookingsFindFirstArgs>(args?: SelectSubset<T, bookingsFindFirstArgs<ExtArgs>>): Prisma__bookingsClient<$Result.GetResult<Prisma.$bookingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bookings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {bookingsFindFirstOrThrowArgs} args - Arguments to find a Bookings
     * @example
     * // Get one Bookings
     * const bookings = await prisma.bookings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends bookingsFindFirstOrThrowArgs>(args?: SelectSubset<T, bookingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__bookingsClient<$Result.GetResult<Prisma.$bookingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Bookings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {bookingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Bookings
     * const bookings = await prisma.bookings.findMany()
     * 
     * // Get first 10 Bookings
     * const bookings = await prisma.bookings.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bookingsWithIdOnly = await prisma.bookings.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends bookingsFindManyArgs>(args?: SelectSubset<T, bookingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$bookingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Bookings.
     * @param {bookingsCreateArgs} args - Arguments to create a Bookings.
     * @example
     * // Create one Bookings
     * const Bookings = await prisma.bookings.create({
     *   data: {
     *     // ... data to create a Bookings
     *   }
     * })
     * 
     */
    create<T extends bookingsCreateArgs>(args: SelectSubset<T, bookingsCreateArgs<ExtArgs>>): Prisma__bookingsClient<$Result.GetResult<Prisma.$bookingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Bookings.
     * @param {bookingsCreateManyArgs} args - Arguments to create many Bookings.
     * @example
     * // Create many Bookings
     * const bookings = await prisma.bookings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends bookingsCreateManyArgs>(args?: SelectSubset<T, bookingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Bookings and returns the data saved in the database.
     * @param {bookingsCreateManyAndReturnArgs} args - Arguments to create many Bookings.
     * @example
     * // Create many Bookings
     * const bookings = await prisma.bookings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Bookings and only return the `id`
     * const bookingsWithIdOnly = await prisma.bookings.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends bookingsCreateManyAndReturnArgs>(args?: SelectSubset<T, bookingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$bookingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Bookings.
     * @param {bookingsDeleteArgs} args - Arguments to delete one Bookings.
     * @example
     * // Delete one Bookings
     * const Bookings = await prisma.bookings.delete({
     *   where: {
     *     // ... filter to delete one Bookings
     *   }
     * })
     * 
     */
    delete<T extends bookingsDeleteArgs>(args: SelectSubset<T, bookingsDeleteArgs<ExtArgs>>): Prisma__bookingsClient<$Result.GetResult<Prisma.$bookingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Bookings.
     * @param {bookingsUpdateArgs} args - Arguments to update one Bookings.
     * @example
     * // Update one Bookings
     * const bookings = await prisma.bookings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends bookingsUpdateArgs>(args: SelectSubset<T, bookingsUpdateArgs<ExtArgs>>): Prisma__bookingsClient<$Result.GetResult<Prisma.$bookingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Bookings.
     * @param {bookingsDeleteManyArgs} args - Arguments to filter Bookings to delete.
     * @example
     * // Delete a few Bookings
     * const { count } = await prisma.bookings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends bookingsDeleteManyArgs>(args?: SelectSubset<T, bookingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {bookingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Bookings
     * const bookings = await prisma.bookings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends bookingsUpdateManyArgs>(args: SelectSubset<T, bookingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bookings and returns the data updated in the database.
     * @param {bookingsUpdateManyAndReturnArgs} args - Arguments to update many Bookings.
     * @example
     * // Update many Bookings
     * const bookings = await prisma.bookings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Bookings and only return the `id`
     * const bookingsWithIdOnly = await prisma.bookings.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends bookingsUpdateManyAndReturnArgs>(args: SelectSubset<T, bookingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$bookingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Bookings.
     * @param {bookingsUpsertArgs} args - Arguments to update or create a Bookings.
     * @example
     * // Update or create a Bookings
     * const bookings = await prisma.bookings.upsert({
     *   create: {
     *     // ... data to create a Bookings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Bookings we want to update
     *   }
     * })
     */
    upsert<T extends bookingsUpsertArgs>(args: SelectSubset<T, bookingsUpsertArgs<ExtArgs>>): Prisma__bookingsClient<$Result.GetResult<Prisma.$bookingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {bookingsCountArgs} args - Arguments to filter Bookings to count.
     * @example
     * // Count the number of Bookings
     * const count = await prisma.bookings.count({
     *   where: {
     *     // ... the filter for the Bookings we want to count
     *   }
     * })
    **/
    count<T extends bookingsCountArgs>(
      args?: Subset<T, bookingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BookingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BookingsAggregateArgs>(args: Subset<T, BookingsAggregateArgs>): Prisma.PrismaPromise<GetBookingsAggregateType<T>>

    /**
     * Group by Bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {bookingsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends bookingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: bookingsGroupByArgs['orderBy'] }
        : { orderBy?: bookingsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, bookingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBookingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the bookings model
   */
  readonly fields: bookingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for bookings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__bookingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    slots<T extends slotsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, slotsDefaultArgs<ExtArgs>>): Prisma__slotsClient<$Result.GetResult<Prisma.$slotsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the bookings model
   */
  interface bookingsFieldRefs {
    readonly id: FieldRef<"bookings", 'String'>
    readonly slotId: FieldRef<"bookings", 'String'>
    readonly name: FieldRef<"bookings", 'String'>
    readonly phone: FieldRef<"bookings", 'String'>
    readonly email: FieldRef<"bookings", 'String'>
    readonly numberOfPeople: FieldRef<"bookings", 'Int'>
    readonly qrCode: FieldRef<"bookings", 'String'>
    readonly status: FieldRef<"bookings", 'String'>
    readonly checkedInAt: FieldRef<"bookings", 'DateTime'>
    readonly createdAt: FieldRef<"bookings", 'DateTime'>
    readonly updatedAt: FieldRef<"bookings", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * bookings findUnique
   */
  export type bookingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the bookings
     */
    select?: bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the bookings
     */
    omit?: bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bookingsInclude<ExtArgs> | null
    /**
     * Filter, which bookings to fetch.
     */
    where: bookingsWhereUniqueInput
  }

  /**
   * bookings findUniqueOrThrow
   */
  export type bookingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the bookings
     */
    select?: bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the bookings
     */
    omit?: bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bookingsInclude<ExtArgs> | null
    /**
     * Filter, which bookings to fetch.
     */
    where: bookingsWhereUniqueInput
  }

  /**
   * bookings findFirst
   */
  export type bookingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the bookings
     */
    select?: bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the bookings
     */
    omit?: bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bookingsInclude<ExtArgs> | null
    /**
     * Filter, which bookings to fetch.
     */
    where?: bookingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of bookings to fetch.
     */
    orderBy?: bookingsOrderByWithRelationInput | bookingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for bookings.
     */
    cursor?: bookingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of bookings.
     */
    distinct?: BookingsScalarFieldEnum | BookingsScalarFieldEnum[]
  }

  /**
   * bookings findFirstOrThrow
   */
  export type bookingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the bookings
     */
    select?: bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the bookings
     */
    omit?: bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bookingsInclude<ExtArgs> | null
    /**
     * Filter, which bookings to fetch.
     */
    where?: bookingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of bookings to fetch.
     */
    orderBy?: bookingsOrderByWithRelationInput | bookingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for bookings.
     */
    cursor?: bookingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of bookings.
     */
    distinct?: BookingsScalarFieldEnum | BookingsScalarFieldEnum[]
  }

  /**
   * bookings findMany
   */
  export type bookingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the bookings
     */
    select?: bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the bookings
     */
    omit?: bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bookingsInclude<ExtArgs> | null
    /**
     * Filter, which bookings to fetch.
     */
    where?: bookingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of bookings to fetch.
     */
    orderBy?: bookingsOrderByWithRelationInput | bookingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing bookings.
     */
    cursor?: bookingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` bookings.
     */
    skip?: number
    distinct?: BookingsScalarFieldEnum | BookingsScalarFieldEnum[]
  }

  /**
   * bookings create
   */
  export type bookingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the bookings
     */
    select?: bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the bookings
     */
    omit?: bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bookingsInclude<ExtArgs> | null
    /**
     * The data needed to create a bookings.
     */
    data: XOR<bookingsCreateInput, bookingsUncheckedCreateInput>
  }

  /**
   * bookings createMany
   */
  export type bookingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many bookings.
     */
    data: bookingsCreateManyInput | bookingsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * bookings createManyAndReturn
   */
  export type bookingsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the bookings
     */
    select?: bookingsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the bookings
     */
    omit?: bookingsOmit<ExtArgs> | null
    /**
     * The data used to create many bookings.
     */
    data: bookingsCreateManyInput | bookingsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bookingsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * bookings update
   */
  export type bookingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the bookings
     */
    select?: bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the bookings
     */
    omit?: bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bookingsInclude<ExtArgs> | null
    /**
     * The data needed to update a bookings.
     */
    data: XOR<bookingsUpdateInput, bookingsUncheckedUpdateInput>
    /**
     * Choose, which bookings to update.
     */
    where: bookingsWhereUniqueInput
  }

  /**
   * bookings updateMany
   */
  export type bookingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update bookings.
     */
    data: XOR<bookingsUpdateManyMutationInput, bookingsUncheckedUpdateManyInput>
    /**
     * Filter which bookings to update
     */
    where?: bookingsWhereInput
    /**
     * Limit how many bookings to update.
     */
    limit?: number
  }

  /**
   * bookings updateManyAndReturn
   */
  export type bookingsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the bookings
     */
    select?: bookingsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the bookings
     */
    omit?: bookingsOmit<ExtArgs> | null
    /**
     * The data used to update bookings.
     */
    data: XOR<bookingsUpdateManyMutationInput, bookingsUncheckedUpdateManyInput>
    /**
     * Filter which bookings to update
     */
    where?: bookingsWhereInput
    /**
     * Limit how many bookings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bookingsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * bookings upsert
   */
  export type bookingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the bookings
     */
    select?: bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the bookings
     */
    omit?: bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bookingsInclude<ExtArgs> | null
    /**
     * The filter to search for the bookings to update in case it exists.
     */
    where: bookingsWhereUniqueInput
    /**
     * In case the bookings found by the `where` argument doesn't exist, create a new bookings with this data.
     */
    create: XOR<bookingsCreateInput, bookingsUncheckedCreateInput>
    /**
     * In case the bookings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<bookingsUpdateInput, bookingsUncheckedUpdateInput>
  }

  /**
   * bookings delete
   */
  export type bookingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the bookings
     */
    select?: bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the bookings
     */
    omit?: bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bookingsInclude<ExtArgs> | null
    /**
     * Filter which bookings to delete.
     */
    where: bookingsWhereUniqueInput
  }

  /**
   * bookings deleteMany
   */
  export type bookingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which bookings to delete
     */
    where?: bookingsWhereInput
    /**
     * Limit how many bookings to delete.
     */
    limit?: number
  }

  /**
   * bookings without action
   */
  export type bookingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the bookings
     */
    select?: bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the bookings
     */
    omit?: bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bookingsInclude<ExtArgs> | null
  }


  /**
   * Model crowd_snapshots
   */

  export type AggregateCrowd_snapshots = {
    _count: Crowd_snapshotsCountAggregateOutputType | null
    _avg: Crowd_snapshotsAvgAggregateOutputType | null
    _sum: Crowd_snapshotsSumAggregateOutputType | null
    _min: Crowd_snapshotsMinAggregateOutputType | null
    _max: Crowd_snapshotsMaxAggregateOutputType | null
  }

  export type Crowd_snapshotsAvgAggregateOutputType = {
    footfall: number | null
    capacity: number | null
    dayOfWeek: number | null
    hourOfDay: number | null
  }

  export type Crowd_snapshotsSumAggregateOutputType = {
    footfall: number | null
    capacity: number | null
    dayOfWeek: number | null
    hourOfDay: number | null
  }

  export type Crowd_snapshotsMinAggregateOutputType = {
    id: string | null
    zoneId: string | null
    zoneName: string | null
    footfall: number | null
    capacity: number | null
    timestamp: Date | null
    dayOfWeek: number | null
    hourOfDay: number | null
    createdAt: Date | null
  }

  export type Crowd_snapshotsMaxAggregateOutputType = {
    id: string | null
    zoneId: string | null
    zoneName: string | null
    footfall: number | null
    capacity: number | null
    timestamp: Date | null
    dayOfWeek: number | null
    hourOfDay: number | null
    createdAt: Date | null
  }

  export type Crowd_snapshotsCountAggregateOutputType = {
    id: number
    zoneId: number
    zoneName: number
    footfall: number
    capacity: number
    timestamp: number
    dayOfWeek: number
    hourOfDay: number
    createdAt: number
    _all: number
  }


  export type Crowd_snapshotsAvgAggregateInputType = {
    footfall?: true
    capacity?: true
    dayOfWeek?: true
    hourOfDay?: true
  }

  export type Crowd_snapshotsSumAggregateInputType = {
    footfall?: true
    capacity?: true
    dayOfWeek?: true
    hourOfDay?: true
  }

  export type Crowd_snapshotsMinAggregateInputType = {
    id?: true
    zoneId?: true
    zoneName?: true
    footfall?: true
    capacity?: true
    timestamp?: true
    dayOfWeek?: true
    hourOfDay?: true
    createdAt?: true
  }

  export type Crowd_snapshotsMaxAggregateInputType = {
    id?: true
    zoneId?: true
    zoneName?: true
    footfall?: true
    capacity?: true
    timestamp?: true
    dayOfWeek?: true
    hourOfDay?: true
    createdAt?: true
  }

  export type Crowd_snapshotsCountAggregateInputType = {
    id?: true
    zoneId?: true
    zoneName?: true
    footfall?: true
    capacity?: true
    timestamp?: true
    dayOfWeek?: true
    hourOfDay?: true
    createdAt?: true
    _all?: true
  }

  export type Crowd_snapshotsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which crowd_snapshots to aggregate.
     */
    where?: crowd_snapshotsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of crowd_snapshots to fetch.
     */
    orderBy?: crowd_snapshotsOrderByWithRelationInput | crowd_snapshotsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: crowd_snapshotsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` crowd_snapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` crowd_snapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned crowd_snapshots
    **/
    _count?: true | Crowd_snapshotsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Crowd_snapshotsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Crowd_snapshotsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Crowd_snapshotsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Crowd_snapshotsMaxAggregateInputType
  }

  export type GetCrowd_snapshotsAggregateType<T extends Crowd_snapshotsAggregateArgs> = {
        [P in keyof T & keyof AggregateCrowd_snapshots]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCrowd_snapshots[P]>
      : GetScalarType<T[P], AggregateCrowd_snapshots[P]>
  }




  export type crowd_snapshotsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: crowd_snapshotsWhereInput
    orderBy?: crowd_snapshotsOrderByWithAggregationInput | crowd_snapshotsOrderByWithAggregationInput[]
    by: Crowd_snapshotsScalarFieldEnum[] | Crowd_snapshotsScalarFieldEnum
    having?: crowd_snapshotsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Crowd_snapshotsCountAggregateInputType | true
    _avg?: Crowd_snapshotsAvgAggregateInputType
    _sum?: Crowd_snapshotsSumAggregateInputType
    _min?: Crowd_snapshotsMinAggregateInputType
    _max?: Crowd_snapshotsMaxAggregateInputType
  }

  export type Crowd_snapshotsGroupByOutputType = {
    id: string
    zoneId: string
    zoneName: string
    footfall: number
    capacity: number
    timestamp: Date
    dayOfWeek: number
    hourOfDay: number
    createdAt: Date
    _count: Crowd_snapshotsCountAggregateOutputType | null
    _avg: Crowd_snapshotsAvgAggregateOutputType | null
    _sum: Crowd_snapshotsSumAggregateOutputType | null
    _min: Crowd_snapshotsMinAggregateOutputType | null
    _max: Crowd_snapshotsMaxAggregateOutputType | null
  }

  type GetCrowd_snapshotsGroupByPayload<T extends crowd_snapshotsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Crowd_snapshotsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Crowd_snapshotsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Crowd_snapshotsGroupByOutputType[P]>
            : GetScalarType<T[P], Crowd_snapshotsGroupByOutputType[P]>
        }
      >
    >


  export type crowd_snapshotsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    zoneId?: boolean
    zoneName?: boolean
    footfall?: boolean
    capacity?: boolean
    timestamp?: boolean
    dayOfWeek?: boolean
    hourOfDay?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["crowd_snapshots"]>

  export type crowd_snapshotsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    zoneId?: boolean
    zoneName?: boolean
    footfall?: boolean
    capacity?: boolean
    timestamp?: boolean
    dayOfWeek?: boolean
    hourOfDay?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["crowd_snapshots"]>

  export type crowd_snapshotsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    zoneId?: boolean
    zoneName?: boolean
    footfall?: boolean
    capacity?: boolean
    timestamp?: boolean
    dayOfWeek?: boolean
    hourOfDay?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["crowd_snapshots"]>

  export type crowd_snapshotsSelectScalar = {
    id?: boolean
    zoneId?: boolean
    zoneName?: boolean
    footfall?: boolean
    capacity?: boolean
    timestamp?: boolean
    dayOfWeek?: boolean
    hourOfDay?: boolean
    createdAt?: boolean
  }

  export type crowd_snapshotsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "zoneId" | "zoneName" | "footfall" | "capacity" | "timestamp" | "dayOfWeek" | "hourOfDay" | "createdAt", ExtArgs["result"]["crowd_snapshots"]>

  export type $crowd_snapshotsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "crowd_snapshots"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      zoneId: string
      zoneName: string
      footfall: number
      capacity: number
      timestamp: Date
      dayOfWeek: number
      hourOfDay: number
      createdAt: Date
    }, ExtArgs["result"]["crowd_snapshots"]>
    composites: {}
  }

  type crowd_snapshotsGetPayload<S extends boolean | null | undefined | crowd_snapshotsDefaultArgs> = $Result.GetResult<Prisma.$crowd_snapshotsPayload, S>

  type crowd_snapshotsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<crowd_snapshotsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Crowd_snapshotsCountAggregateInputType | true
    }

  export interface crowd_snapshotsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['crowd_snapshots'], meta: { name: 'crowd_snapshots' } }
    /**
     * Find zero or one Crowd_snapshots that matches the filter.
     * @param {crowd_snapshotsFindUniqueArgs} args - Arguments to find a Crowd_snapshots
     * @example
     * // Get one Crowd_snapshots
     * const crowd_snapshots = await prisma.crowd_snapshots.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends crowd_snapshotsFindUniqueArgs>(args: SelectSubset<T, crowd_snapshotsFindUniqueArgs<ExtArgs>>): Prisma__crowd_snapshotsClient<$Result.GetResult<Prisma.$crowd_snapshotsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Crowd_snapshots that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {crowd_snapshotsFindUniqueOrThrowArgs} args - Arguments to find a Crowd_snapshots
     * @example
     * // Get one Crowd_snapshots
     * const crowd_snapshots = await prisma.crowd_snapshots.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends crowd_snapshotsFindUniqueOrThrowArgs>(args: SelectSubset<T, crowd_snapshotsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__crowd_snapshotsClient<$Result.GetResult<Prisma.$crowd_snapshotsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Crowd_snapshots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {crowd_snapshotsFindFirstArgs} args - Arguments to find a Crowd_snapshots
     * @example
     * // Get one Crowd_snapshots
     * const crowd_snapshots = await prisma.crowd_snapshots.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends crowd_snapshotsFindFirstArgs>(args?: SelectSubset<T, crowd_snapshotsFindFirstArgs<ExtArgs>>): Prisma__crowd_snapshotsClient<$Result.GetResult<Prisma.$crowd_snapshotsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Crowd_snapshots that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {crowd_snapshotsFindFirstOrThrowArgs} args - Arguments to find a Crowd_snapshots
     * @example
     * // Get one Crowd_snapshots
     * const crowd_snapshots = await prisma.crowd_snapshots.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends crowd_snapshotsFindFirstOrThrowArgs>(args?: SelectSubset<T, crowd_snapshotsFindFirstOrThrowArgs<ExtArgs>>): Prisma__crowd_snapshotsClient<$Result.GetResult<Prisma.$crowd_snapshotsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Crowd_snapshots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {crowd_snapshotsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Crowd_snapshots
     * const crowd_snapshots = await prisma.crowd_snapshots.findMany()
     * 
     * // Get first 10 Crowd_snapshots
     * const crowd_snapshots = await prisma.crowd_snapshots.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const crowd_snapshotsWithIdOnly = await prisma.crowd_snapshots.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends crowd_snapshotsFindManyArgs>(args?: SelectSubset<T, crowd_snapshotsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$crowd_snapshotsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Crowd_snapshots.
     * @param {crowd_snapshotsCreateArgs} args - Arguments to create a Crowd_snapshots.
     * @example
     * // Create one Crowd_snapshots
     * const Crowd_snapshots = await prisma.crowd_snapshots.create({
     *   data: {
     *     // ... data to create a Crowd_snapshots
     *   }
     * })
     * 
     */
    create<T extends crowd_snapshotsCreateArgs>(args: SelectSubset<T, crowd_snapshotsCreateArgs<ExtArgs>>): Prisma__crowd_snapshotsClient<$Result.GetResult<Prisma.$crowd_snapshotsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Crowd_snapshots.
     * @param {crowd_snapshotsCreateManyArgs} args - Arguments to create many Crowd_snapshots.
     * @example
     * // Create many Crowd_snapshots
     * const crowd_snapshots = await prisma.crowd_snapshots.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends crowd_snapshotsCreateManyArgs>(args?: SelectSubset<T, crowd_snapshotsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Crowd_snapshots and returns the data saved in the database.
     * @param {crowd_snapshotsCreateManyAndReturnArgs} args - Arguments to create many Crowd_snapshots.
     * @example
     * // Create many Crowd_snapshots
     * const crowd_snapshots = await prisma.crowd_snapshots.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Crowd_snapshots and only return the `id`
     * const crowd_snapshotsWithIdOnly = await prisma.crowd_snapshots.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends crowd_snapshotsCreateManyAndReturnArgs>(args?: SelectSubset<T, crowd_snapshotsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$crowd_snapshotsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Crowd_snapshots.
     * @param {crowd_snapshotsDeleteArgs} args - Arguments to delete one Crowd_snapshots.
     * @example
     * // Delete one Crowd_snapshots
     * const Crowd_snapshots = await prisma.crowd_snapshots.delete({
     *   where: {
     *     // ... filter to delete one Crowd_snapshots
     *   }
     * })
     * 
     */
    delete<T extends crowd_snapshotsDeleteArgs>(args: SelectSubset<T, crowd_snapshotsDeleteArgs<ExtArgs>>): Prisma__crowd_snapshotsClient<$Result.GetResult<Prisma.$crowd_snapshotsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Crowd_snapshots.
     * @param {crowd_snapshotsUpdateArgs} args - Arguments to update one Crowd_snapshots.
     * @example
     * // Update one Crowd_snapshots
     * const crowd_snapshots = await prisma.crowd_snapshots.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends crowd_snapshotsUpdateArgs>(args: SelectSubset<T, crowd_snapshotsUpdateArgs<ExtArgs>>): Prisma__crowd_snapshotsClient<$Result.GetResult<Prisma.$crowd_snapshotsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Crowd_snapshots.
     * @param {crowd_snapshotsDeleteManyArgs} args - Arguments to filter Crowd_snapshots to delete.
     * @example
     * // Delete a few Crowd_snapshots
     * const { count } = await prisma.crowd_snapshots.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends crowd_snapshotsDeleteManyArgs>(args?: SelectSubset<T, crowd_snapshotsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Crowd_snapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {crowd_snapshotsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Crowd_snapshots
     * const crowd_snapshots = await prisma.crowd_snapshots.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends crowd_snapshotsUpdateManyArgs>(args: SelectSubset<T, crowd_snapshotsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Crowd_snapshots and returns the data updated in the database.
     * @param {crowd_snapshotsUpdateManyAndReturnArgs} args - Arguments to update many Crowd_snapshots.
     * @example
     * // Update many Crowd_snapshots
     * const crowd_snapshots = await prisma.crowd_snapshots.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Crowd_snapshots and only return the `id`
     * const crowd_snapshotsWithIdOnly = await prisma.crowd_snapshots.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends crowd_snapshotsUpdateManyAndReturnArgs>(args: SelectSubset<T, crowd_snapshotsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$crowd_snapshotsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Crowd_snapshots.
     * @param {crowd_snapshotsUpsertArgs} args - Arguments to update or create a Crowd_snapshots.
     * @example
     * // Update or create a Crowd_snapshots
     * const crowd_snapshots = await prisma.crowd_snapshots.upsert({
     *   create: {
     *     // ... data to create a Crowd_snapshots
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Crowd_snapshots we want to update
     *   }
     * })
     */
    upsert<T extends crowd_snapshotsUpsertArgs>(args: SelectSubset<T, crowd_snapshotsUpsertArgs<ExtArgs>>): Prisma__crowd_snapshotsClient<$Result.GetResult<Prisma.$crowd_snapshotsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Crowd_snapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {crowd_snapshotsCountArgs} args - Arguments to filter Crowd_snapshots to count.
     * @example
     * // Count the number of Crowd_snapshots
     * const count = await prisma.crowd_snapshots.count({
     *   where: {
     *     // ... the filter for the Crowd_snapshots we want to count
     *   }
     * })
    **/
    count<T extends crowd_snapshotsCountArgs>(
      args?: Subset<T, crowd_snapshotsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Crowd_snapshotsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Crowd_snapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Crowd_snapshotsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Crowd_snapshotsAggregateArgs>(args: Subset<T, Crowd_snapshotsAggregateArgs>): Prisma.PrismaPromise<GetCrowd_snapshotsAggregateType<T>>

    /**
     * Group by Crowd_snapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {crowd_snapshotsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends crowd_snapshotsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: crowd_snapshotsGroupByArgs['orderBy'] }
        : { orderBy?: crowd_snapshotsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, crowd_snapshotsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCrowd_snapshotsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the crowd_snapshots model
   */
  readonly fields: crowd_snapshotsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for crowd_snapshots.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__crowd_snapshotsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the crowd_snapshots model
   */
  interface crowd_snapshotsFieldRefs {
    readonly id: FieldRef<"crowd_snapshots", 'String'>
    readonly zoneId: FieldRef<"crowd_snapshots", 'String'>
    readonly zoneName: FieldRef<"crowd_snapshots", 'String'>
    readonly footfall: FieldRef<"crowd_snapshots", 'Int'>
    readonly capacity: FieldRef<"crowd_snapshots", 'Int'>
    readonly timestamp: FieldRef<"crowd_snapshots", 'DateTime'>
    readonly dayOfWeek: FieldRef<"crowd_snapshots", 'Int'>
    readonly hourOfDay: FieldRef<"crowd_snapshots", 'Int'>
    readonly createdAt: FieldRef<"crowd_snapshots", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * crowd_snapshots findUnique
   */
  export type crowd_snapshotsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the crowd_snapshots
     */
    select?: crowd_snapshotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the crowd_snapshots
     */
    omit?: crowd_snapshotsOmit<ExtArgs> | null
    /**
     * Filter, which crowd_snapshots to fetch.
     */
    where: crowd_snapshotsWhereUniqueInput
  }

  /**
   * crowd_snapshots findUniqueOrThrow
   */
  export type crowd_snapshotsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the crowd_snapshots
     */
    select?: crowd_snapshotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the crowd_snapshots
     */
    omit?: crowd_snapshotsOmit<ExtArgs> | null
    /**
     * Filter, which crowd_snapshots to fetch.
     */
    where: crowd_snapshotsWhereUniqueInput
  }

  /**
   * crowd_snapshots findFirst
   */
  export type crowd_snapshotsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the crowd_snapshots
     */
    select?: crowd_snapshotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the crowd_snapshots
     */
    omit?: crowd_snapshotsOmit<ExtArgs> | null
    /**
     * Filter, which crowd_snapshots to fetch.
     */
    where?: crowd_snapshotsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of crowd_snapshots to fetch.
     */
    orderBy?: crowd_snapshotsOrderByWithRelationInput | crowd_snapshotsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for crowd_snapshots.
     */
    cursor?: crowd_snapshotsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` crowd_snapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` crowd_snapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of crowd_snapshots.
     */
    distinct?: Crowd_snapshotsScalarFieldEnum | Crowd_snapshotsScalarFieldEnum[]
  }

  /**
   * crowd_snapshots findFirstOrThrow
   */
  export type crowd_snapshotsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the crowd_snapshots
     */
    select?: crowd_snapshotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the crowd_snapshots
     */
    omit?: crowd_snapshotsOmit<ExtArgs> | null
    /**
     * Filter, which crowd_snapshots to fetch.
     */
    where?: crowd_snapshotsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of crowd_snapshots to fetch.
     */
    orderBy?: crowd_snapshotsOrderByWithRelationInput | crowd_snapshotsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for crowd_snapshots.
     */
    cursor?: crowd_snapshotsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` crowd_snapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` crowd_snapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of crowd_snapshots.
     */
    distinct?: Crowd_snapshotsScalarFieldEnum | Crowd_snapshotsScalarFieldEnum[]
  }

  /**
   * crowd_snapshots findMany
   */
  export type crowd_snapshotsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the crowd_snapshots
     */
    select?: crowd_snapshotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the crowd_snapshots
     */
    omit?: crowd_snapshotsOmit<ExtArgs> | null
    /**
     * Filter, which crowd_snapshots to fetch.
     */
    where?: crowd_snapshotsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of crowd_snapshots to fetch.
     */
    orderBy?: crowd_snapshotsOrderByWithRelationInput | crowd_snapshotsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing crowd_snapshots.
     */
    cursor?: crowd_snapshotsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` crowd_snapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` crowd_snapshots.
     */
    skip?: number
    distinct?: Crowd_snapshotsScalarFieldEnum | Crowd_snapshotsScalarFieldEnum[]
  }

  /**
   * crowd_snapshots create
   */
  export type crowd_snapshotsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the crowd_snapshots
     */
    select?: crowd_snapshotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the crowd_snapshots
     */
    omit?: crowd_snapshotsOmit<ExtArgs> | null
    /**
     * The data needed to create a crowd_snapshots.
     */
    data: XOR<crowd_snapshotsCreateInput, crowd_snapshotsUncheckedCreateInput>
  }

  /**
   * crowd_snapshots createMany
   */
  export type crowd_snapshotsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many crowd_snapshots.
     */
    data: crowd_snapshotsCreateManyInput | crowd_snapshotsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * crowd_snapshots createManyAndReturn
   */
  export type crowd_snapshotsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the crowd_snapshots
     */
    select?: crowd_snapshotsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the crowd_snapshots
     */
    omit?: crowd_snapshotsOmit<ExtArgs> | null
    /**
     * The data used to create many crowd_snapshots.
     */
    data: crowd_snapshotsCreateManyInput | crowd_snapshotsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * crowd_snapshots update
   */
  export type crowd_snapshotsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the crowd_snapshots
     */
    select?: crowd_snapshotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the crowd_snapshots
     */
    omit?: crowd_snapshotsOmit<ExtArgs> | null
    /**
     * The data needed to update a crowd_snapshots.
     */
    data: XOR<crowd_snapshotsUpdateInput, crowd_snapshotsUncheckedUpdateInput>
    /**
     * Choose, which crowd_snapshots to update.
     */
    where: crowd_snapshotsWhereUniqueInput
  }

  /**
   * crowd_snapshots updateMany
   */
  export type crowd_snapshotsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update crowd_snapshots.
     */
    data: XOR<crowd_snapshotsUpdateManyMutationInput, crowd_snapshotsUncheckedUpdateManyInput>
    /**
     * Filter which crowd_snapshots to update
     */
    where?: crowd_snapshotsWhereInput
    /**
     * Limit how many crowd_snapshots to update.
     */
    limit?: number
  }

  /**
   * crowd_snapshots updateManyAndReturn
   */
  export type crowd_snapshotsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the crowd_snapshots
     */
    select?: crowd_snapshotsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the crowd_snapshots
     */
    omit?: crowd_snapshotsOmit<ExtArgs> | null
    /**
     * The data used to update crowd_snapshots.
     */
    data: XOR<crowd_snapshotsUpdateManyMutationInput, crowd_snapshotsUncheckedUpdateManyInput>
    /**
     * Filter which crowd_snapshots to update
     */
    where?: crowd_snapshotsWhereInput
    /**
     * Limit how many crowd_snapshots to update.
     */
    limit?: number
  }

  /**
   * crowd_snapshots upsert
   */
  export type crowd_snapshotsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the crowd_snapshots
     */
    select?: crowd_snapshotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the crowd_snapshots
     */
    omit?: crowd_snapshotsOmit<ExtArgs> | null
    /**
     * The filter to search for the crowd_snapshots to update in case it exists.
     */
    where: crowd_snapshotsWhereUniqueInput
    /**
     * In case the crowd_snapshots found by the `where` argument doesn't exist, create a new crowd_snapshots with this data.
     */
    create: XOR<crowd_snapshotsCreateInput, crowd_snapshotsUncheckedCreateInput>
    /**
     * In case the crowd_snapshots was found with the provided `where` argument, update it with this data.
     */
    update: XOR<crowd_snapshotsUpdateInput, crowd_snapshotsUncheckedUpdateInput>
  }

  /**
   * crowd_snapshots delete
   */
  export type crowd_snapshotsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the crowd_snapshots
     */
    select?: crowd_snapshotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the crowd_snapshots
     */
    omit?: crowd_snapshotsOmit<ExtArgs> | null
    /**
     * Filter which crowd_snapshots to delete.
     */
    where: crowd_snapshotsWhereUniqueInput
  }

  /**
   * crowd_snapshots deleteMany
   */
  export type crowd_snapshotsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which crowd_snapshots to delete
     */
    where?: crowd_snapshotsWhereInput
    /**
     * Limit how many crowd_snapshots to delete.
     */
    limit?: number
  }

  /**
   * crowd_snapshots without action
   */
  export type crowd_snapshotsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the crowd_snapshots
     */
    select?: crowd_snapshotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the crowd_snapshots
     */
    omit?: crowd_snapshotsOmit<ExtArgs> | null
  }


  /**
   * Model password_reset_tokens
   */

  export type AggregatePassword_reset_tokens = {
    _count: Password_reset_tokensCountAggregateOutputType | null
    _min: Password_reset_tokensMinAggregateOutputType | null
    _max: Password_reset_tokensMaxAggregateOutputType | null
  }

  export type Password_reset_tokensMinAggregateOutputType = {
    id: string | null
    userId: string | null
    token: string | null
    expiresAt: Date | null
    createdAt: Date | null
    usedAt: Date | null
  }

  export type Password_reset_tokensMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    token: string | null
    expiresAt: Date | null
    createdAt: Date | null
    usedAt: Date | null
  }

  export type Password_reset_tokensCountAggregateOutputType = {
    id: number
    userId: number
    token: number
    expiresAt: number
    createdAt: number
    usedAt: number
    _all: number
  }


  export type Password_reset_tokensMinAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    expiresAt?: true
    createdAt?: true
    usedAt?: true
  }

  export type Password_reset_tokensMaxAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    expiresAt?: true
    createdAt?: true
    usedAt?: true
  }

  export type Password_reset_tokensCountAggregateInputType = {
    id?: true
    userId?: true
    token?: true
    expiresAt?: true
    createdAt?: true
    usedAt?: true
    _all?: true
  }

  export type Password_reset_tokensAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which password_reset_tokens to aggregate.
     */
    where?: password_reset_tokensWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of password_reset_tokens to fetch.
     */
    orderBy?: password_reset_tokensOrderByWithRelationInput | password_reset_tokensOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: password_reset_tokensWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` password_reset_tokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` password_reset_tokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned password_reset_tokens
    **/
    _count?: true | Password_reset_tokensCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Password_reset_tokensMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Password_reset_tokensMaxAggregateInputType
  }

  export type GetPassword_reset_tokensAggregateType<T extends Password_reset_tokensAggregateArgs> = {
        [P in keyof T & keyof AggregatePassword_reset_tokens]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePassword_reset_tokens[P]>
      : GetScalarType<T[P], AggregatePassword_reset_tokens[P]>
  }




  export type password_reset_tokensGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: password_reset_tokensWhereInput
    orderBy?: password_reset_tokensOrderByWithAggregationInput | password_reset_tokensOrderByWithAggregationInput[]
    by: Password_reset_tokensScalarFieldEnum[] | Password_reset_tokensScalarFieldEnum
    having?: password_reset_tokensScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Password_reset_tokensCountAggregateInputType | true
    _min?: Password_reset_tokensMinAggregateInputType
    _max?: Password_reset_tokensMaxAggregateInputType
  }

  export type Password_reset_tokensGroupByOutputType = {
    id: string
    userId: string
    token: string
    expiresAt: Date
    createdAt: Date
    usedAt: Date | null
    _count: Password_reset_tokensCountAggregateOutputType | null
    _min: Password_reset_tokensMinAggregateOutputType | null
    _max: Password_reset_tokensMaxAggregateOutputType | null
  }

  type GetPassword_reset_tokensGroupByPayload<T extends password_reset_tokensGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Password_reset_tokensGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Password_reset_tokensGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Password_reset_tokensGroupByOutputType[P]>
            : GetScalarType<T[P], Password_reset_tokensGroupByOutputType[P]>
        }
      >
    >


  export type password_reset_tokensSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    token?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    usedAt?: boolean
    users?: boolean | usersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["password_reset_tokens"]>

  export type password_reset_tokensSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    token?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    usedAt?: boolean
    users?: boolean | usersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["password_reset_tokens"]>

  export type password_reset_tokensSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    token?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    usedAt?: boolean
    users?: boolean | usersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["password_reset_tokens"]>

  export type password_reset_tokensSelectScalar = {
    id?: boolean
    userId?: boolean
    token?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    usedAt?: boolean
  }

  export type password_reset_tokensOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "token" | "expiresAt" | "createdAt" | "usedAt", ExtArgs["result"]["password_reset_tokens"]>
  export type password_reset_tokensInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | usersDefaultArgs<ExtArgs>
  }
  export type password_reset_tokensIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | usersDefaultArgs<ExtArgs>
  }
  export type password_reset_tokensIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | usersDefaultArgs<ExtArgs>
  }

  export type $password_reset_tokensPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "password_reset_tokens"
    objects: {
      users: Prisma.$usersPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      token: string
      expiresAt: Date
      createdAt: Date
      usedAt: Date | null
    }, ExtArgs["result"]["password_reset_tokens"]>
    composites: {}
  }

  type password_reset_tokensGetPayload<S extends boolean | null | undefined | password_reset_tokensDefaultArgs> = $Result.GetResult<Prisma.$password_reset_tokensPayload, S>

  type password_reset_tokensCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<password_reset_tokensFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Password_reset_tokensCountAggregateInputType | true
    }

  export interface password_reset_tokensDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['password_reset_tokens'], meta: { name: 'password_reset_tokens' } }
    /**
     * Find zero or one Password_reset_tokens that matches the filter.
     * @param {password_reset_tokensFindUniqueArgs} args - Arguments to find a Password_reset_tokens
     * @example
     * // Get one Password_reset_tokens
     * const password_reset_tokens = await prisma.password_reset_tokens.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends password_reset_tokensFindUniqueArgs>(args: SelectSubset<T, password_reset_tokensFindUniqueArgs<ExtArgs>>): Prisma__password_reset_tokensClient<$Result.GetResult<Prisma.$password_reset_tokensPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Password_reset_tokens that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {password_reset_tokensFindUniqueOrThrowArgs} args - Arguments to find a Password_reset_tokens
     * @example
     * // Get one Password_reset_tokens
     * const password_reset_tokens = await prisma.password_reset_tokens.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends password_reset_tokensFindUniqueOrThrowArgs>(args: SelectSubset<T, password_reset_tokensFindUniqueOrThrowArgs<ExtArgs>>): Prisma__password_reset_tokensClient<$Result.GetResult<Prisma.$password_reset_tokensPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Password_reset_tokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {password_reset_tokensFindFirstArgs} args - Arguments to find a Password_reset_tokens
     * @example
     * // Get one Password_reset_tokens
     * const password_reset_tokens = await prisma.password_reset_tokens.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends password_reset_tokensFindFirstArgs>(args?: SelectSubset<T, password_reset_tokensFindFirstArgs<ExtArgs>>): Prisma__password_reset_tokensClient<$Result.GetResult<Prisma.$password_reset_tokensPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Password_reset_tokens that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {password_reset_tokensFindFirstOrThrowArgs} args - Arguments to find a Password_reset_tokens
     * @example
     * // Get one Password_reset_tokens
     * const password_reset_tokens = await prisma.password_reset_tokens.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends password_reset_tokensFindFirstOrThrowArgs>(args?: SelectSubset<T, password_reset_tokensFindFirstOrThrowArgs<ExtArgs>>): Prisma__password_reset_tokensClient<$Result.GetResult<Prisma.$password_reset_tokensPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Password_reset_tokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {password_reset_tokensFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Password_reset_tokens
     * const password_reset_tokens = await prisma.password_reset_tokens.findMany()
     * 
     * // Get first 10 Password_reset_tokens
     * const password_reset_tokens = await prisma.password_reset_tokens.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const password_reset_tokensWithIdOnly = await prisma.password_reset_tokens.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends password_reset_tokensFindManyArgs>(args?: SelectSubset<T, password_reset_tokensFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$password_reset_tokensPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Password_reset_tokens.
     * @param {password_reset_tokensCreateArgs} args - Arguments to create a Password_reset_tokens.
     * @example
     * // Create one Password_reset_tokens
     * const Password_reset_tokens = await prisma.password_reset_tokens.create({
     *   data: {
     *     // ... data to create a Password_reset_tokens
     *   }
     * })
     * 
     */
    create<T extends password_reset_tokensCreateArgs>(args: SelectSubset<T, password_reset_tokensCreateArgs<ExtArgs>>): Prisma__password_reset_tokensClient<$Result.GetResult<Prisma.$password_reset_tokensPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Password_reset_tokens.
     * @param {password_reset_tokensCreateManyArgs} args - Arguments to create many Password_reset_tokens.
     * @example
     * // Create many Password_reset_tokens
     * const password_reset_tokens = await prisma.password_reset_tokens.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends password_reset_tokensCreateManyArgs>(args?: SelectSubset<T, password_reset_tokensCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Password_reset_tokens and returns the data saved in the database.
     * @param {password_reset_tokensCreateManyAndReturnArgs} args - Arguments to create many Password_reset_tokens.
     * @example
     * // Create many Password_reset_tokens
     * const password_reset_tokens = await prisma.password_reset_tokens.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Password_reset_tokens and only return the `id`
     * const password_reset_tokensWithIdOnly = await prisma.password_reset_tokens.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends password_reset_tokensCreateManyAndReturnArgs>(args?: SelectSubset<T, password_reset_tokensCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$password_reset_tokensPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Password_reset_tokens.
     * @param {password_reset_tokensDeleteArgs} args - Arguments to delete one Password_reset_tokens.
     * @example
     * // Delete one Password_reset_tokens
     * const Password_reset_tokens = await prisma.password_reset_tokens.delete({
     *   where: {
     *     // ... filter to delete one Password_reset_tokens
     *   }
     * })
     * 
     */
    delete<T extends password_reset_tokensDeleteArgs>(args: SelectSubset<T, password_reset_tokensDeleteArgs<ExtArgs>>): Prisma__password_reset_tokensClient<$Result.GetResult<Prisma.$password_reset_tokensPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Password_reset_tokens.
     * @param {password_reset_tokensUpdateArgs} args - Arguments to update one Password_reset_tokens.
     * @example
     * // Update one Password_reset_tokens
     * const password_reset_tokens = await prisma.password_reset_tokens.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends password_reset_tokensUpdateArgs>(args: SelectSubset<T, password_reset_tokensUpdateArgs<ExtArgs>>): Prisma__password_reset_tokensClient<$Result.GetResult<Prisma.$password_reset_tokensPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Password_reset_tokens.
     * @param {password_reset_tokensDeleteManyArgs} args - Arguments to filter Password_reset_tokens to delete.
     * @example
     * // Delete a few Password_reset_tokens
     * const { count } = await prisma.password_reset_tokens.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends password_reset_tokensDeleteManyArgs>(args?: SelectSubset<T, password_reset_tokensDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Password_reset_tokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {password_reset_tokensUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Password_reset_tokens
     * const password_reset_tokens = await prisma.password_reset_tokens.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends password_reset_tokensUpdateManyArgs>(args: SelectSubset<T, password_reset_tokensUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Password_reset_tokens and returns the data updated in the database.
     * @param {password_reset_tokensUpdateManyAndReturnArgs} args - Arguments to update many Password_reset_tokens.
     * @example
     * // Update many Password_reset_tokens
     * const password_reset_tokens = await prisma.password_reset_tokens.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Password_reset_tokens and only return the `id`
     * const password_reset_tokensWithIdOnly = await prisma.password_reset_tokens.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends password_reset_tokensUpdateManyAndReturnArgs>(args: SelectSubset<T, password_reset_tokensUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$password_reset_tokensPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Password_reset_tokens.
     * @param {password_reset_tokensUpsertArgs} args - Arguments to update or create a Password_reset_tokens.
     * @example
     * // Update or create a Password_reset_tokens
     * const password_reset_tokens = await prisma.password_reset_tokens.upsert({
     *   create: {
     *     // ... data to create a Password_reset_tokens
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Password_reset_tokens we want to update
     *   }
     * })
     */
    upsert<T extends password_reset_tokensUpsertArgs>(args: SelectSubset<T, password_reset_tokensUpsertArgs<ExtArgs>>): Prisma__password_reset_tokensClient<$Result.GetResult<Prisma.$password_reset_tokensPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Password_reset_tokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {password_reset_tokensCountArgs} args - Arguments to filter Password_reset_tokens to count.
     * @example
     * // Count the number of Password_reset_tokens
     * const count = await prisma.password_reset_tokens.count({
     *   where: {
     *     // ... the filter for the Password_reset_tokens we want to count
     *   }
     * })
    **/
    count<T extends password_reset_tokensCountArgs>(
      args?: Subset<T, password_reset_tokensCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Password_reset_tokensCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Password_reset_tokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Password_reset_tokensAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Password_reset_tokensAggregateArgs>(args: Subset<T, Password_reset_tokensAggregateArgs>): Prisma.PrismaPromise<GetPassword_reset_tokensAggregateType<T>>

    /**
     * Group by Password_reset_tokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {password_reset_tokensGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends password_reset_tokensGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: password_reset_tokensGroupByArgs['orderBy'] }
        : { orderBy?: password_reset_tokensGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, password_reset_tokensGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPassword_reset_tokensGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the password_reset_tokens model
   */
  readonly fields: password_reset_tokensFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for password_reset_tokens.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__password_reset_tokensClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends usersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, usersDefaultArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the password_reset_tokens model
   */
  interface password_reset_tokensFieldRefs {
    readonly id: FieldRef<"password_reset_tokens", 'String'>
    readonly userId: FieldRef<"password_reset_tokens", 'String'>
    readonly token: FieldRef<"password_reset_tokens", 'String'>
    readonly expiresAt: FieldRef<"password_reset_tokens", 'DateTime'>
    readonly createdAt: FieldRef<"password_reset_tokens", 'DateTime'>
    readonly usedAt: FieldRef<"password_reset_tokens", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * password_reset_tokens findUnique
   */
  export type password_reset_tokensFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the password_reset_tokens
     */
    select?: password_reset_tokensSelect<ExtArgs> | null
    /**
     * Omit specific fields from the password_reset_tokens
     */
    omit?: password_reset_tokensOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: password_reset_tokensInclude<ExtArgs> | null
    /**
     * Filter, which password_reset_tokens to fetch.
     */
    where: password_reset_tokensWhereUniqueInput
  }

  /**
   * password_reset_tokens findUniqueOrThrow
   */
  export type password_reset_tokensFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the password_reset_tokens
     */
    select?: password_reset_tokensSelect<ExtArgs> | null
    /**
     * Omit specific fields from the password_reset_tokens
     */
    omit?: password_reset_tokensOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: password_reset_tokensInclude<ExtArgs> | null
    /**
     * Filter, which password_reset_tokens to fetch.
     */
    where: password_reset_tokensWhereUniqueInput
  }

  /**
   * password_reset_tokens findFirst
   */
  export type password_reset_tokensFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the password_reset_tokens
     */
    select?: password_reset_tokensSelect<ExtArgs> | null
    /**
     * Omit specific fields from the password_reset_tokens
     */
    omit?: password_reset_tokensOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: password_reset_tokensInclude<ExtArgs> | null
    /**
     * Filter, which password_reset_tokens to fetch.
     */
    where?: password_reset_tokensWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of password_reset_tokens to fetch.
     */
    orderBy?: password_reset_tokensOrderByWithRelationInput | password_reset_tokensOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for password_reset_tokens.
     */
    cursor?: password_reset_tokensWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` password_reset_tokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` password_reset_tokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of password_reset_tokens.
     */
    distinct?: Password_reset_tokensScalarFieldEnum | Password_reset_tokensScalarFieldEnum[]
  }

  /**
   * password_reset_tokens findFirstOrThrow
   */
  export type password_reset_tokensFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the password_reset_tokens
     */
    select?: password_reset_tokensSelect<ExtArgs> | null
    /**
     * Omit specific fields from the password_reset_tokens
     */
    omit?: password_reset_tokensOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: password_reset_tokensInclude<ExtArgs> | null
    /**
     * Filter, which password_reset_tokens to fetch.
     */
    where?: password_reset_tokensWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of password_reset_tokens to fetch.
     */
    orderBy?: password_reset_tokensOrderByWithRelationInput | password_reset_tokensOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for password_reset_tokens.
     */
    cursor?: password_reset_tokensWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` password_reset_tokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` password_reset_tokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of password_reset_tokens.
     */
    distinct?: Password_reset_tokensScalarFieldEnum | Password_reset_tokensScalarFieldEnum[]
  }

  /**
   * password_reset_tokens findMany
   */
  export type password_reset_tokensFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the password_reset_tokens
     */
    select?: password_reset_tokensSelect<ExtArgs> | null
    /**
     * Omit specific fields from the password_reset_tokens
     */
    omit?: password_reset_tokensOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: password_reset_tokensInclude<ExtArgs> | null
    /**
     * Filter, which password_reset_tokens to fetch.
     */
    where?: password_reset_tokensWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of password_reset_tokens to fetch.
     */
    orderBy?: password_reset_tokensOrderByWithRelationInput | password_reset_tokensOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing password_reset_tokens.
     */
    cursor?: password_reset_tokensWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` password_reset_tokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` password_reset_tokens.
     */
    skip?: number
    distinct?: Password_reset_tokensScalarFieldEnum | Password_reset_tokensScalarFieldEnum[]
  }

  /**
   * password_reset_tokens create
   */
  export type password_reset_tokensCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the password_reset_tokens
     */
    select?: password_reset_tokensSelect<ExtArgs> | null
    /**
     * Omit specific fields from the password_reset_tokens
     */
    omit?: password_reset_tokensOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: password_reset_tokensInclude<ExtArgs> | null
    /**
     * The data needed to create a password_reset_tokens.
     */
    data: XOR<password_reset_tokensCreateInput, password_reset_tokensUncheckedCreateInput>
  }

  /**
   * password_reset_tokens createMany
   */
  export type password_reset_tokensCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many password_reset_tokens.
     */
    data: password_reset_tokensCreateManyInput | password_reset_tokensCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * password_reset_tokens createManyAndReturn
   */
  export type password_reset_tokensCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the password_reset_tokens
     */
    select?: password_reset_tokensSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the password_reset_tokens
     */
    omit?: password_reset_tokensOmit<ExtArgs> | null
    /**
     * The data used to create many password_reset_tokens.
     */
    data: password_reset_tokensCreateManyInput | password_reset_tokensCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: password_reset_tokensIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * password_reset_tokens update
   */
  export type password_reset_tokensUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the password_reset_tokens
     */
    select?: password_reset_tokensSelect<ExtArgs> | null
    /**
     * Omit specific fields from the password_reset_tokens
     */
    omit?: password_reset_tokensOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: password_reset_tokensInclude<ExtArgs> | null
    /**
     * The data needed to update a password_reset_tokens.
     */
    data: XOR<password_reset_tokensUpdateInput, password_reset_tokensUncheckedUpdateInput>
    /**
     * Choose, which password_reset_tokens to update.
     */
    where: password_reset_tokensWhereUniqueInput
  }

  /**
   * password_reset_tokens updateMany
   */
  export type password_reset_tokensUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update password_reset_tokens.
     */
    data: XOR<password_reset_tokensUpdateManyMutationInput, password_reset_tokensUncheckedUpdateManyInput>
    /**
     * Filter which password_reset_tokens to update
     */
    where?: password_reset_tokensWhereInput
    /**
     * Limit how many password_reset_tokens to update.
     */
    limit?: number
  }

  /**
   * password_reset_tokens updateManyAndReturn
   */
  export type password_reset_tokensUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the password_reset_tokens
     */
    select?: password_reset_tokensSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the password_reset_tokens
     */
    omit?: password_reset_tokensOmit<ExtArgs> | null
    /**
     * The data used to update password_reset_tokens.
     */
    data: XOR<password_reset_tokensUpdateManyMutationInput, password_reset_tokensUncheckedUpdateManyInput>
    /**
     * Filter which password_reset_tokens to update
     */
    where?: password_reset_tokensWhereInput
    /**
     * Limit how many password_reset_tokens to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: password_reset_tokensIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * password_reset_tokens upsert
   */
  export type password_reset_tokensUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the password_reset_tokens
     */
    select?: password_reset_tokensSelect<ExtArgs> | null
    /**
     * Omit specific fields from the password_reset_tokens
     */
    omit?: password_reset_tokensOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: password_reset_tokensInclude<ExtArgs> | null
    /**
     * The filter to search for the password_reset_tokens to update in case it exists.
     */
    where: password_reset_tokensWhereUniqueInput
    /**
     * In case the password_reset_tokens found by the `where` argument doesn't exist, create a new password_reset_tokens with this data.
     */
    create: XOR<password_reset_tokensCreateInput, password_reset_tokensUncheckedCreateInput>
    /**
     * In case the password_reset_tokens was found with the provided `where` argument, update it with this data.
     */
    update: XOR<password_reset_tokensUpdateInput, password_reset_tokensUncheckedUpdateInput>
  }

  /**
   * password_reset_tokens delete
   */
  export type password_reset_tokensDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the password_reset_tokens
     */
    select?: password_reset_tokensSelect<ExtArgs> | null
    /**
     * Omit specific fields from the password_reset_tokens
     */
    omit?: password_reset_tokensOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: password_reset_tokensInclude<ExtArgs> | null
    /**
     * Filter which password_reset_tokens to delete.
     */
    where: password_reset_tokensWhereUniqueInput
  }

  /**
   * password_reset_tokens deleteMany
   */
  export type password_reset_tokensDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which password_reset_tokens to delete
     */
    where?: password_reset_tokensWhereInput
    /**
     * Limit how many password_reset_tokens to delete.
     */
    limit?: number
  }

  /**
   * password_reset_tokens without action
   */
  export type password_reset_tokensDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the password_reset_tokens
     */
    select?: password_reset_tokensSelect<ExtArgs> | null
    /**
     * Omit specific fields from the password_reset_tokens
     */
    omit?: password_reset_tokensOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: password_reset_tokensInclude<ExtArgs> | null
  }


  /**
   * Model peak_hour_patterns
   */

  export type AggregatePeak_hour_patterns = {
    _count: Peak_hour_patternsCountAggregateOutputType | null
    _avg: Peak_hour_patternsAvgAggregateOutputType | null
    _sum: Peak_hour_patternsSumAggregateOutputType | null
    _min: Peak_hour_patternsMinAggregateOutputType | null
    _max: Peak_hour_patternsMaxAggregateOutputType | null
  }

  export type Peak_hour_patternsAvgAggregateOutputType = {
    dayOfWeek: number | null
    startHour: number | null
    endHour: number | null
    avgFootfall: number | null
    confidence: number | null
  }

  export type Peak_hour_patternsSumAggregateOutputType = {
    dayOfWeek: number | null
    startHour: number | null
    endHour: number | null
    avgFootfall: number | null
    confidence: number | null
  }

  export type Peak_hour_patternsMinAggregateOutputType = {
    id: string | null
    zoneId: string | null
    dayOfWeek: number | null
    startHour: number | null
    endHour: number | null
    avgFootfall: number | null
    confidence: number | null
    updatedAt: Date | null
  }

  export type Peak_hour_patternsMaxAggregateOutputType = {
    id: string | null
    zoneId: string | null
    dayOfWeek: number | null
    startHour: number | null
    endHour: number | null
    avgFootfall: number | null
    confidence: number | null
    updatedAt: Date | null
  }

  export type Peak_hour_patternsCountAggregateOutputType = {
    id: number
    zoneId: number
    dayOfWeek: number
    startHour: number
    endHour: number
    avgFootfall: number
    confidence: number
    updatedAt: number
    _all: number
  }


  export type Peak_hour_patternsAvgAggregateInputType = {
    dayOfWeek?: true
    startHour?: true
    endHour?: true
    avgFootfall?: true
    confidence?: true
  }

  export type Peak_hour_patternsSumAggregateInputType = {
    dayOfWeek?: true
    startHour?: true
    endHour?: true
    avgFootfall?: true
    confidence?: true
  }

  export type Peak_hour_patternsMinAggregateInputType = {
    id?: true
    zoneId?: true
    dayOfWeek?: true
    startHour?: true
    endHour?: true
    avgFootfall?: true
    confidence?: true
    updatedAt?: true
  }

  export type Peak_hour_patternsMaxAggregateInputType = {
    id?: true
    zoneId?: true
    dayOfWeek?: true
    startHour?: true
    endHour?: true
    avgFootfall?: true
    confidence?: true
    updatedAt?: true
  }

  export type Peak_hour_patternsCountAggregateInputType = {
    id?: true
    zoneId?: true
    dayOfWeek?: true
    startHour?: true
    endHour?: true
    avgFootfall?: true
    confidence?: true
    updatedAt?: true
    _all?: true
  }

  export type Peak_hour_patternsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which peak_hour_patterns to aggregate.
     */
    where?: peak_hour_patternsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of peak_hour_patterns to fetch.
     */
    orderBy?: peak_hour_patternsOrderByWithRelationInput | peak_hour_patternsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: peak_hour_patternsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` peak_hour_patterns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` peak_hour_patterns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned peak_hour_patterns
    **/
    _count?: true | Peak_hour_patternsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Peak_hour_patternsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Peak_hour_patternsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Peak_hour_patternsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Peak_hour_patternsMaxAggregateInputType
  }

  export type GetPeak_hour_patternsAggregateType<T extends Peak_hour_patternsAggregateArgs> = {
        [P in keyof T & keyof AggregatePeak_hour_patterns]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePeak_hour_patterns[P]>
      : GetScalarType<T[P], AggregatePeak_hour_patterns[P]>
  }




  export type peak_hour_patternsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: peak_hour_patternsWhereInput
    orderBy?: peak_hour_patternsOrderByWithAggregationInput | peak_hour_patternsOrderByWithAggregationInput[]
    by: Peak_hour_patternsScalarFieldEnum[] | Peak_hour_patternsScalarFieldEnum
    having?: peak_hour_patternsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Peak_hour_patternsCountAggregateInputType | true
    _avg?: Peak_hour_patternsAvgAggregateInputType
    _sum?: Peak_hour_patternsSumAggregateInputType
    _min?: Peak_hour_patternsMinAggregateInputType
    _max?: Peak_hour_patternsMaxAggregateInputType
  }

  export type Peak_hour_patternsGroupByOutputType = {
    id: string
    zoneId: string
    dayOfWeek: number
    startHour: number
    endHour: number
    avgFootfall: number
    confidence: number
    updatedAt: Date
    _count: Peak_hour_patternsCountAggregateOutputType | null
    _avg: Peak_hour_patternsAvgAggregateOutputType | null
    _sum: Peak_hour_patternsSumAggregateOutputType | null
    _min: Peak_hour_patternsMinAggregateOutputType | null
    _max: Peak_hour_patternsMaxAggregateOutputType | null
  }

  type GetPeak_hour_patternsGroupByPayload<T extends peak_hour_patternsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Peak_hour_patternsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Peak_hour_patternsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Peak_hour_patternsGroupByOutputType[P]>
            : GetScalarType<T[P], Peak_hour_patternsGroupByOutputType[P]>
        }
      >
    >


  export type peak_hour_patternsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    zoneId?: boolean
    dayOfWeek?: boolean
    startHour?: boolean
    endHour?: boolean
    avgFootfall?: boolean
    confidence?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["peak_hour_patterns"]>

  export type peak_hour_patternsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    zoneId?: boolean
    dayOfWeek?: boolean
    startHour?: boolean
    endHour?: boolean
    avgFootfall?: boolean
    confidence?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["peak_hour_patterns"]>

  export type peak_hour_patternsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    zoneId?: boolean
    dayOfWeek?: boolean
    startHour?: boolean
    endHour?: boolean
    avgFootfall?: boolean
    confidence?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["peak_hour_patterns"]>

  export type peak_hour_patternsSelectScalar = {
    id?: boolean
    zoneId?: boolean
    dayOfWeek?: boolean
    startHour?: boolean
    endHour?: boolean
    avgFootfall?: boolean
    confidence?: boolean
    updatedAt?: boolean
  }

  export type peak_hour_patternsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "zoneId" | "dayOfWeek" | "startHour" | "endHour" | "avgFootfall" | "confidence" | "updatedAt", ExtArgs["result"]["peak_hour_patterns"]>

  export type $peak_hour_patternsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "peak_hour_patterns"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      zoneId: string
      dayOfWeek: number
      startHour: number
      endHour: number
      avgFootfall: number
      confidence: number
      updatedAt: Date
    }, ExtArgs["result"]["peak_hour_patterns"]>
    composites: {}
  }

  type peak_hour_patternsGetPayload<S extends boolean | null | undefined | peak_hour_patternsDefaultArgs> = $Result.GetResult<Prisma.$peak_hour_patternsPayload, S>

  type peak_hour_patternsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<peak_hour_patternsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Peak_hour_patternsCountAggregateInputType | true
    }

  export interface peak_hour_patternsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['peak_hour_patterns'], meta: { name: 'peak_hour_patterns' } }
    /**
     * Find zero or one Peak_hour_patterns that matches the filter.
     * @param {peak_hour_patternsFindUniqueArgs} args - Arguments to find a Peak_hour_patterns
     * @example
     * // Get one Peak_hour_patterns
     * const peak_hour_patterns = await prisma.peak_hour_patterns.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends peak_hour_patternsFindUniqueArgs>(args: SelectSubset<T, peak_hour_patternsFindUniqueArgs<ExtArgs>>): Prisma__peak_hour_patternsClient<$Result.GetResult<Prisma.$peak_hour_patternsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Peak_hour_patterns that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {peak_hour_patternsFindUniqueOrThrowArgs} args - Arguments to find a Peak_hour_patterns
     * @example
     * // Get one Peak_hour_patterns
     * const peak_hour_patterns = await prisma.peak_hour_patterns.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends peak_hour_patternsFindUniqueOrThrowArgs>(args: SelectSubset<T, peak_hour_patternsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__peak_hour_patternsClient<$Result.GetResult<Prisma.$peak_hour_patternsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Peak_hour_patterns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {peak_hour_patternsFindFirstArgs} args - Arguments to find a Peak_hour_patterns
     * @example
     * // Get one Peak_hour_patterns
     * const peak_hour_patterns = await prisma.peak_hour_patterns.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends peak_hour_patternsFindFirstArgs>(args?: SelectSubset<T, peak_hour_patternsFindFirstArgs<ExtArgs>>): Prisma__peak_hour_patternsClient<$Result.GetResult<Prisma.$peak_hour_patternsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Peak_hour_patterns that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {peak_hour_patternsFindFirstOrThrowArgs} args - Arguments to find a Peak_hour_patterns
     * @example
     * // Get one Peak_hour_patterns
     * const peak_hour_patterns = await prisma.peak_hour_patterns.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends peak_hour_patternsFindFirstOrThrowArgs>(args?: SelectSubset<T, peak_hour_patternsFindFirstOrThrowArgs<ExtArgs>>): Prisma__peak_hour_patternsClient<$Result.GetResult<Prisma.$peak_hour_patternsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Peak_hour_patterns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {peak_hour_patternsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Peak_hour_patterns
     * const peak_hour_patterns = await prisma.peak_hour_patterns.findMany()
     * 
     * // Get first 10 Peak_hour_patterns
     * const peak_hour_patterns = await prisma.peak_hour_patterns.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const peak_hour_patternsWithIdOnly = await prisma.peak_hour_patterns.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends peak_hour_patternsFindManyArgs>(args?: SelectSubset<T, peak_hour_patternsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$peak_hour_patternsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Peak_hour_patterns.
     * @param {peak_hour_patternsCreateArgs} args - Arguments to create a Peak_hour_patterns.
     * @example
     * // Create one Peak_hour_patterns
     * const Peak_hour_patterns = await prisma.peak_hour_patterns.create({
     *   data: {
     *     // ... data to create a Peak_hour_patterns
     *   }
     * })
     * 
     */
    create<T extends peak_hour_patternsCreateArgs>(args: SelectSubset<T, peak_hour_patternsCreateArgs<ExtArgs>>): Prisma__peak_hour_patternsClient<$Result.GetResult<Prisma.$peak_hour_patternsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Peak_hour_patterns.
     * @param {peak_hour_patternsCreateManyArgs} args - Arguments to create many Peak_hour_patterns.
     * @example
     * // Create many Peak_hour_patterns
     * const peak_hour_patterns = await prisma.peak_hour_patterns.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends peak_hour_patternsCreateManyArgs>(args?: SelectSubset<T, peak_hour_patternsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Peak_hour_patterns and returns the data saved in the database.
     * @param {peak_hour_patternsCreateManyAndReturnArgs} args - Arguments to create many Peak_hour_patterns.
     * @example
     * // Create many Peak_hour_patterns
     * const peak_hour_patterns = await prisma.peak_hour_patterns.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Peak_hour_patterns and only return the `id`
     * const peak_hour_patternsWithIdOnly = await prisma.peak_hour_patterns.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends peak_hour_patternsCreateManyAndReturnArgs>(args?: SelectSubset<T, peak_hour_patternsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$peak_hour_patternsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Peak_hour_patterns.
     * @param {peak_hour_patternsDeleteArgs} args - Arguments to delete one Peak_hour_patterns.
     * @example
     * // Delete one Peak_hour_patterns
     * const Peak_hour_patterns = await prisma.peak_hour_patterns.delete({
     *   where: {
     *     // ... filter to delete one Peak_hour_patterns
     *   }
     * })
     * 
     */
    delete<T extends peak_hour_patternsDeleteArgs>(args: SelectSubset<T, peak_hour_patternsDeleteArgs<ExtArgs>>): Prisma__peak_hour_patternsClient<$Result.GetResult<Prisma.$peak_hour_patternsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Peak_hour_patterns.
     * @param {peak_hour_patternsUpdateArgs} args - Arguments to update one Peak_hour_patterns.
     * @example
     * // Update one Peak_hour_patterns
     * const peak_hour_patterns = await prisma.peak_hour_patterns.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends peak_hour_patternsUpdateArgs>(args: SelectSubset<T, peak_hour_patternsUpdateArgs<ExtArgs>>): Prisma__peak_hour_patternsClient<$Result.GetResult<Prisma.$peak_hour_patternsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Peak_hour_patterns.
     * @param {peak_hour_patternsDeleteManyArgs} args - Arguments to filter Peak_hour_patterns to delete.
     * @example
     * // Delete a few Peak_hour_patterns
     * const { count } = await prisma.peak_hour_patterns.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends peak_hour_patternsDeleteManyArgs>(args?: SelectSubset<T, peak_hour_patternsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Peak_hour_patterns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {peak_hour_patternsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Peak_hour_patterns
     * const peak_hour_patterns = await prisma.peak_hour_patterns.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends peak_hour_patternsUpdateManyArgs>(args: SelectSubset<T, peak_hour_patternsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Peak_hour_patterns and returns the data updated in the database.
     * @param {peak_hour_patternsUpdateManyAndReturnArgs} args - Arguments to update many Peak_hour_patterns.
     * @example
     * // Update many Peak_hour_patterns
     * const peak_hour_patterns = await prisma.peak_hour_patterns.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Peak_hour_patterns and only return the `id`
     * const peak_hour_patternsWithIdOnly = await prisma.peak_hour_patterns.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends peak_hour_patternsUpdateManyAndReturnArgs>(args: SelectSubset<T, peak_hour_patternsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$peak_hour_patternsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Peak_hour_patterns.
     * @param {peak_hour_patternsUpsertArgs} args - Arguments to update or create a Peak_hour_patterns.
     * @example
     * // Update or create a Peak_hour_patterns
     * const peak_hour_patterns = await prisma.peak_hour_patterns.upsert({
     *   create: {
     *     // ... data to create a Peak_hour_patterns
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Peak_hour_patterns we want to update
     *   }
     * })
     */
    upsert<T extends peak_hour_patternsUpsertArgs>(args: SelectSubset<T, peak_hour_patternsUpsertArgs<ExtArgs>>): Prisma__peak_hour_patternsClient<$Result.GetResult<Prisma.$peak_hour_patternsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Peak_hour_patterns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {peak_hour_patternsCountArgs} args - Arguments to filter Peak_hour_patterns to count.
     * @example
     * // Count the number of Peak_hour_patterns
     * const count = await prisma.peak_hour_patterns.count({
     *   where: {
     *     // ... the filter for the Peak_hour_patterns we want to count
     *   }
     * })
    **/
    count<T extends peak_hour_patternsCountArgs>(
      args?: Subset<T, peak_hour_patternsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Peak_hour_patternsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Peak_hour_patterns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Peak_hour_patternsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Peak_hour_patternsAggregateArgs>(args: Subset<T, Peak_hour_patternsAggregateArgs>): Prisma.PrismaPromise<GetPeak_hour_patternsAggregateType<T>>

    /**
     * Group by Peak_hour_patterns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {peak_hour_patternsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends peak_hour_patternsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: peak_hour_patternsGroupByArgs['orderBy'] }
        : { orderBy?: peak_hour_patternsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, peak_hour_patternsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPeak_hour_patternsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the peak_hour_patterns model
   */
  readonly fields: peak_hour_patternsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for peak_hour_patterns.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__peak_hour_patternsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the peak_hour_patterns model
   */
  interface peak_hour_patternsFieldRefs {
    readonly id: FieldRef<"peak_hour_patterns", 'String'>
    readonly zoneId: FieldRef<"peak_hour_patterns", 'String'>
    readonly dayOfWeek: FieldRef<"peak_hour_patterns", 'Int'>
    readonly startHour: FieldRef<"peak_hour_patterns", 'Int'>
    readonly endHour: FieldRef<"peak_hour_patterns", 'Int'>
    readonly avgFootfall: FieldRef<"peak_hour_patterns", 'Float'>
    readonly confidence: FieldRef<"peak_hour_patterns", 'Float'>
    readonly updatedAt: FieldRef<"peak_hour_patterns", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * peak_hour_patterns findUnique
   */
  export type peak_hour_patternsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the peak_hour_patterns
     */
    select?: peak_hour_patternsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the peak_hour_patterns
     */
    omit?: peak_hour_patternsOmit<ExtArgs> | null
    /**
     * Filter, which peak_hour_patterns to fetch.
     */
    where: peak_hour_patternsWhereUniqueInput
  }

  /**
   * peak_hour_patterns findUniqueOrThrow
   */
  export type peak_hour_patternsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the peak_hour_patterns
     */
    select?: peak_hour_patternsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the peak_hour_patterns
     */
    omit?: peak_hour_patternsOmit<ExtArgs> | null
    /**
     * Filter, which peak_hour_patterns to fetch.
     */
    where: peak_hour_patternsWhereUniqueInput
  }

  /**
   * peak_hour_patterns findFirst
   */
  export type peak_hour_patternsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the peak_hour_patterns
     */
    select?: peak_hour_patternsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the peak_hour_patterns
     */
    omit?: peak_hour_patternsOmit<ExtArgs> | null
    /**
     * Filter, which peak_hour_patterns to fetch.
     */
    where?: peak_hour_patternsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of peak_hour_patterns to fetch.
     */
    orderBy?: peak_hour_patternsOrderByWithRelationInput | peak_hour_patternsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for peak_hour_patterns.
     */
    cursor?: peak_hour_patternsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` peak_hour_patterns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` peak_hour_patterns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of peak_hour_patterns.
     */
    distinct?: Peak_hour_patternsScalarFieldEnum | Peak_hour_patternsScalarFieldEnum[]
  }

  /**
   * peak_hour_patterns findFirstOrThrow
   */
  export type peak_hour_patternsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the peak_hour_patterns
     */
    select?: peak_hour_patternsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the peak_hour_patterns
     */
    omit?: peak_hour_patternsOmit<ExtArgs> | null
    /**
     * Filter, which peak_hour_patterns to fetch.
     */
    where?: peak_hour_patternsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of peak_hour_patterns to fetch.
     */
    orderBy?: peak_hour_patternsOrderByWithRelationInput | peak_hour_patternsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for peak_hour_patterns.
     */
    cursor?: peak_hour_patternsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` peak_hour_patterns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` peak_hour_patterns.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of peak_hour_patterns.
     */
    distinct?: Peak_hour_patternsScalarFieldEnum | Peak_hour_patternsScalarFieldEnum[]
  }

  /**
   * peak_hour_patterns findMany
   */
  export type peak_hour_patternsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the peak_hour_patterns
     */
    select?: peak_hour_patternsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the peak_hour_patterns
     */
    omit?: peak_hour_patternsOmit<ExtArgs> | null
    /**
     * Filter, which peak_hour_patterns to fetch.
     */
    where?: peak_hour_patternsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of peak_hour_patterns to fetch.
     */
    orderBy?: peak_hour_patternsOrderByWithRelationInput | peak_hour_patternsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing peak_hour_patterns.
     */
    cursor?: peak_hour_patternsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` peak_hour_patterns from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` peak_hour_patterns.
     */
    skip?: number
    distinct?: Peak_hour_patternsScalarFieldEnum | Peak_hour_patternsScalarFieldEnum[]
  }

  /**
   * peak_hour_patterns create
   */
  export type peak_hour_patternsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the peak_hour_patterns
     */
    select?: peak_hour_patternsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the peak_hour_patterns
     */
    omit?: peak_hour_patternsOmit<ExtArgs> | null
    /**
     * The data needed to create a peak_hour_patterns.
     */
    data: XOR<peak_hour_patternsCreateInput, peak_hour_patternsUncheckedCreateInput>
  }

  /**
   * peak_hour_patterns createMany
   */
  export type peak_hour_patternsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many peak_hour_patterns.
     */
    data: peak_hour_patternsCreateManyInput | peak_hour_patternsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * peak_hour_patterns createManyAndReturn
   */
  export type peak_hour_patternsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the peak_hour_patterns
     */
    select?: peak_hour_patternsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the peak_hour_patterns
     */
    omit?: peak_hour_patternsOmit<ExtArgs> | null
    /**
     * The data used to create many peak_hour_patterns.
     */
    data: peak_hour_patternsCreateManyInput | peak_hour_patternsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * peak_hour_patterns update
   */
  export type peak_hour_patternsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the peak_hour_patterns
     */
    select?: peak_hour_patternsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the peak_hour_patterns
     */
    omit?: peak_hour_patternsOmit<ExtArgs> | null
    /**
     * The data needed to update a peak_hour_patterns.
     */
    data: XOR<peak_hour_patternsUpdateInput, peak_hour_patternsUncheckedUpdateInput>
    /**
     * Choose, which peak_hour_patterns to update.
     */
    where: peak_hour_patternsWhereUniqueInput
  }

  /**
   * peak_hour_patterns updateMany
   */
  export type peak_hour_patternsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update peak_hour_patterns.
     */
    data: XOR<peak_hour_patternsUpdateManyMutationInput, peak_hour_patternsUncheckedUpdateManyInput>
    /**
     * Filter which peak_hour_patterns to update
     */
    where?: peak_hour_patternsWhereInput
    /**
     * Limit how many peak_hour_patterns to update.
     */
    limit?: number
  }

  /**
   * peak_hour_patterns updateManyAndReturn
   */
  export type peak_hour_patternsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the peak_hour_patterns
     */
    select?: peak_hour_patternsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the peak_hour_patterns
     */
    omit?: peak_hour_patternsOmit<ExtArgs> | null
    /**
     * The data used to update peak_hour_patterns.
     */
    data: XOR<peak_hour_patternsUpdateManyMutationInput, peak_hour_patternsUncheckedUpdateManyInput>
    /**
     * Filter which peak_hour_patterns to update
     */
    where?: peak_hour_patternsWhereInput
    /**
     * Limit how many peak_hour_patterns to update.
     */
    limit?: number
  }

  /**
   * peak_hour_patterns upsert
   */
  export type peak_hour_patternsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the peak_hour_patterns
     */
    select?: peak_hour_patternsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the peak_hour_patterns
     */
    omit?: peak_hour_patternsOmit<ExtArgs> | null
    /**
     * The filter to search for the peak_hour_patterns to update in case it exists.
     */
    where: peak_hour_patternsWhereUniqueInput
    /**
     * In case the peak_hour_patterns found by the `where` argument doesn't exist, create a new peak_hour_patterns with this data.
     */
    create: XOR<peak_hour_patternsCreateInput, peak_hour_patternsUncheckedCreateInput>
    /**
     * In case the peak_hour_patterns was found with the provided `where` argument, update it with this data.
     */
    update: XOR<peak_hour_patternsUpdateInput, peak_hour_patternsUncheckedUpdateInput>
  }

  /**
   * peak_hour_patterns delete
   */
  export type peak_hour_patternsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the peak_hour_patterns
     */
    select?: peak_hour_patternsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the peak_hour_patterns
     */
    omit?: peak_hour_patternsOmit<ExtArgs> | null
    /**
     * Filter which peak_hour_patterns to delete.
     */
    where: peak_hour_patternsWhereUniqueInput
  }

  /**
   * peak_hour_patterns deleteMany
   */
  export type peak_hour_patternsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which peak_hour_patterns to delete
     */
    where?: peak_hour_patternsWhereInput
    /**
     * Limit how many peak_hour_patterns to delete.
     */
    limit?: number
  }

  /**
   * peak_hour_patterns without action
   */
  export type peak_hour_patternsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the peak_hour_patterns
     */
    select?: peak_hour_patternsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the peak_hour_patterns
     */
    omit?: peak_hour_patternsOmit<ExtArgs> | null
  }


  /**
   * Model prediction_cache
   */

  export type AggregatePrediction_cache = {
    _count: Prediction_cacheCountAggregateOutputType | null
    _avg: Prediction_cacheAvgAggregateOutputType | null
    _sum: Prediction_cacheSumAggregateOutputType | null
    _min: Prediction_cacheMinAggregateOutputType | null
    _max: Prediction_cacheMaxAggregateOutputType | null
  }

  export type Prediction_cacheAvgAggregateOutputType = {
    predictedValue: number | null
    confidence: number | null
  }

  export type Prediction_cacheSumAggregateOutputType = {
    predictedValue: number | null
    confidence: number | null
  }

  export type Prediction_cacheMinAggregateOutputType = {
    id: string | null
    zoneId: string | null
    predictedTime: Date | null
    predictedValue: number | null
    confidence: number | null
    generatedAt: Date | null
    expiresAt: Date | null
  }

  export type Prediction_cacheMaxAggregateOutputType = {
    id: string | null
    zoneId: string | null
    predictedTime: Date | null
    predictedValue: number | null
    confidence: number | null
    generatedAt: Date | null
    expiresAt: Date | null
  }

  export type Prediction_cacheCountAggregateOutputType = {
    id: number
    zoneId: number
    predictedTime: number
    predictedValue: number
    confidence: number
    generatedAt: number
    expiresAt: number
    _all: number
  }


  export type Prediction_cacheAvgAggregateInputType = {
    predictedValue?: true
    confidence?: true
  }

  export type Prediction_cacheSumAggregateInputType = {
    predictedValue?: true
    confidence?: true
  }

  export type Prediction_cacheMinAggregateInputType = {
    id?: true
    zoneId?: true
    predictedTime?: true
    predictedValue?: true
    confidence?: true
    generatedAt?: true
    expiresAt?: true
  }

  export type Prediction_cacheMaxAggregateInputType = {
    id?: true
    zoneId?: true
    predictedTime?: true
    predictedValue?: true
    confidence?: true
    generatedAt?: true
    expiresAt?: true
  }

  export type Prediction_cacheCountAggregateInputType = {
    id?: true
    zoneId?: true
    predictedTime?: true
    predictedValue?: true
    confidence?: true
    generatedAt?: true
    expiresAt?: true
    _all?: true
  }

  export type Prediction_cacheAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which prediction_cache to aggregate.
     */
    where?: prediction_cacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of prediction_caches to fetch.
     */
    orderBy?: prediction_cacheOrderByWithRelationInput | prediction_cacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: prediction_cacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` prediction_caches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` prediction_caches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned prediction_caches
    **/
    _count?: true | Prediction_cacheCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Prediction_cacheAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Prediction_cacheSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Prediction_cacheMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Prediction_cacheMaxAggregateInputType
  }

  export type GetPrediction_cacheAggregateType<T extends Prediction_cacheAggregateArgs> = {
        [P in keyof T & keyof AggregatePrediction_cache]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePrediction_cache[P]>
      : GetScalarType<T[P], AggregatePrediction_cache[P]>
  }




  export type prediction_cacheGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: prediction_cacheWhereInput
    orderBy?: prediction_cacheOrderByWithAggregationInput | prediction_cacheOrderByWithAggregationInput[]
    by: Prediction_cacheScalarFieldEnum[] | Prediction_cacheScalarFieldEnum
    having?: prediction_cacheScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Prediction_cacheCountAggregateInputType | true
    _avg?: Prediction_cacheAvgAggregateInputType
    _sum?: Prediction_cacheSumAggregateInputType
    _min?: Prediction_cacheMinAggregateInputType
    _max?: Prediction_cacheMaxAggregateInputType
  }

  export type Prediction_cacheGroupByOutputType = {
    id: string
    zoneId: string
    predictedTime: Date
    predictedValue: number
    confidence: number
    generatedAt: Date
    expiresAt: Date
    _count: Prediction_cacheCountAggregateOutputType | null
    _avg: Prediction_cacheAvgAggregateOutputType | null
    _sum: Prediction_cacheSumAggregateOutputType | null
    _min: Prediction_cacheMinAggregateOutputType | null
    _max: Prediction_cacheMaxAggregateOutputType | null
  }

  type GetPrediction_cacheGroupByPayload<T extends prediction_cacheGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Prediction_cacheGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Prediction_cacheGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Prediction_cacheGroupByOutputType[P]>
            : GetScalarType<T[P], Prediction_cacheGroupByOutputType[P]>
        }
      >
    >


  export type prediction_cacheSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    zoneId?: boolean
    predictedTime?: boolean
    predictedValue?: boolean
    confidence?: boolean
    generatedAt?: boolean
    expiresAt?: boolean
  }, ExtArgs["result"]["prediction_cache"]>

  export type prediction_cacheSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    zoneId?: boolean
    predictedTime?: boolean
    predictedValue?: boolean
    confidence?: boolean
    generatedAt?: boolean
    expiresAt?: boolean
  }, ExtArgs["result"]["prediction_cache"]>

  export type prediction_cacheSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    zoneId?: boolean
    predictedTime?: boolean
    predictedValue?: boolean
    confidence?: boolean
    generatedAt?: boolean
    expiresAt?: boolean
  }, ExtArgs["result"]["prediction_cache"]>

  export type prediction_cacheSelectScalar = {
    id?: boolean
    zoneId?: boolean
    predictedTime?: boolean
    predictedValue?: boolean
    confidence?: boolean
    generatedAt?: boolean
    expiresAt?: boolean
  }

  export type prediction_cacheOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "zoneId" | "predictedTime" | "predictedValue" | "confidence" | "generatedAt" | "expiresAt", ExtArgs["result"]["prediction_cache"]>

  export type $prediction_cachePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "prediction_cache"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      zoneId: string
      predictedTime: Date
      predictedValue: number
      confidence: number
      generatedAt: Date
      expiresAt: Date
    }, ExtArgs["result"]["prediction_cache"]>
    composites: {}
  }

  type prediction_cacheGetPayload<S extends boolean | null | undefined | prediction_cacheDefaultArgs> = $Result.GetResult<Prisma.$prediction_cachePayload, S>

  type prediction_cacheCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<prediction_cacheFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Prediction_cacheCountAggregateInputType | true
    }

  export interface prediction_cacheDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['prediction_cache'], meta: { name: 'prediction_cache' } }
    /**
     * Find zero or one Prediction_cache that matches the filter.
     * @param {prediction_cacheFindUniqueArgs} args - Arguments to find a Prediction_cache
     * @example
     * // Get one Prediction_cache
     * const prediction_cache = await prisma.prediction_cache.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends prediction_cacheFindUniqueArgs>(args: SelectSubset<T, prediction_cacheFindUniqueArgs<ExtArgs>>): Prisma__prediction_cacheClient<$Result.GetResult<Prisma.$prediction_cachePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Prediction_cache that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {prediction_cacheFindUniqueOrThrowArgs} args - Arguments to find a Prediction_cache
     * @example
     * // Get one Prediction_cache
     * const prediction_cache = await prisma.prediction_cache.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends prediction_cacheFindUniqueOrThrowArgs>(args: SelectSubset<T, prediction_cacheFindUniqueOrThrowArgs<ExtArgs>>): Prisma__prediction_cacheClient<$Result.GetResult<Prisma.$prediction_cachePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Prediction_cache that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {prediction_cacheFindFirstArgs} args - Arguments to find a Prediction_cache
     * @example
     * // Get one Prediction_cache
     * const prediction_cache = await prisma.prediction_cache.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends prediction_cacheFindFirstArgs>(args?: SelectSubset<T, prediction_cacheFindFirstArgs<ExtArgs>>): Prisma__prediction_cacheClient<$Result.GetResult<Prisma.$prediction_cachePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Prediction_cache that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {prediction_cacheFindFirstOrThrowArgs} args - Arguments to find a Prediction_cache
     * @example
     * // Get one Prediction_cache
     * const prediction_cache = await prisma.prediction_cache.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends prediction_cacheFindFirstOrThrowArgs>(args?: SelectSubset<T, prediction_cacheFindFirstOrThrowArgs<ExtArgs>>): Prisma__prediction_cacheClient<$Result.GetResult<Prisma.$prediction_cachePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Prediction_caches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {prediction_cacheFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Prediction_caches
     * const prediction_caches = await prisma.prediction_cache.findMany()
     * 
     * // Get first 10 Prediction_caches
     * const prediction_caches = await prisma.prediction_cache.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const prediction_cacheWithIdOnly = await prisma.prediction_cache.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends prediction_cacheFindManyArgs>(args?: SelectSubset<T, prediction_cacheFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$prediction_cachePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Prediction_cache.
     * @param {prediction_cacheCreateArgs} args - Arguments to create a Prediction_cache.
     * @example
     * // Create one Prediction_cache
     * const Prediction_cache = await prisma.prediction_cache.create({
     *   data: {
     *     // ... data to create a Prediction_cache
     *   }
     * })
     * 
     */
    create<T extends prediction_cacheCreateArgs>(args: SelectSubset<T, prediction_cacheCreateArgs<ExtArgs>>): Prisma__prediction_cacheClient<$Result.GetResult<Prisma.$prediction_cachePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Prediction_caches.
     * @param {prediction_cacheCreateManyArgs} args - Arguments to create many Prediction_caches.
     * @example
     * // Create many Prediction_caches
     * const prediction_cache = await prisma.prediction_cache.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends prediction_cacheCreateManyArgs>(args?: SelectSubset<T, prediction_cacheCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Prediction_caches and returns the data saved in the database.
     * @param {prediction_cacheCreateManyAndReturnArgs} args - Arguments to create many Prediction_caches.
     * @example
     * // Create many Prediction_caches
     * const prediction_cache = await prisma.prediction_cache.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Prediction_caches and only return the `id`
     * const prediction_cacheWithIdOnly = await prisma.prediction_cache.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends prediction_cacheCreateManyAndReturnArgs>(args?: SelectSubset<T, prediction_cacheCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$prediction_cachePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Prediction_cache.
     * @param {prediction_cacheDeleteArgs} args - Arguments to delete one Prediction_cache.
     * @example
     * // Delete one Prediction_cache
     * const Prediction_cache = await prisma.prediction_cache.delete({
     *   where: {
     *     // ... filter to delete one Prediction_cache
     *   }
     * })
     * 
     */
    delete<T extends prediction_cacheDeleteArgs>(args: SelectSubset<T, prediction_cacheDeleteArgs<ExtArgs>>): Prisma__prediction_cacheClient<$Result.GetResult<Prisma.$prediction_cachePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Prediction_cache.
     * @param {prediction_cacheUpdateArgs} args - Arguments to update one Prediction_cache.
     * @example
     * // Update one Prediction_cache
     * const prediction_cache = await prisma.prediction_cache.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends prediction_cacheUpdateArgs>(args: SelectSubset<T, prediction_cacheUpdateArgs<ExtArgs>>): Prisma__prediction_cacheClient<$Result.GetResult<Prisma.$prediction_cachePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Prediction_caches.
     * @param {prediction_cacheDeleteManyArgs} args - Arguments to filter Prediction_caches to delete.
     * @example
     * // Delete a few Prediction_caches
     * const { count } = await prisma.prediction_cache.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends prediction_cacheDeleteManyArgs>(args?: SelectSubset<T, prediction_cacheDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Prediction_caches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {prediction_cacheUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Prediction_caches
     * const prediction_cache = await prisma.prediction_cache.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends prediction_cacheUpdateManyArgs>(args: SelectSubset<T, prediction_cacheUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Prediction_caches and returns the data updated in the database.
     * @param {prediction_cacheUpdateManyAndReturnArgs} args - Arguments to update many Prediction_caches.
     * @example
     * // Update many Prediction_caches
     * const prediction_cache = await prisma.prediction_cache.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Prediction_caches and only return the `id`
     * const prediction_cacheWithIdOnly = await prisma.prediction_cache.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends prediction_cacheUpdateManyAndReturnArgs>(args: SelectSubset<T, prediction_cacheUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$prediction_cachePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Prediction_cache.
     * @param {prediction_cacheUpsertArgs} args - Arguments to update or create a Prediction_cache.
     * @example
     * // Update or create a Prediction_cache
     * const prediction_cache = await prisma.prediction_cache.upsert({
     *   create: {
     *     // ... data to create a Prediction_cache
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Prediction_cache we want to update
     *   }
     * })
     */
    upsert<T extends prediction_cacheUpsertArgs>(args: SelectSubset<T, prediction_cacheUpsertArgs<ExtArgs>>): Prisma__prediction_cacheClient<$Result.GetResult<Prisma.$prediction_cachePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Prediction_caches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {prediction_cacheCountArgs} args - Arguments to filter Prediction_caches to count.
     * @example
     * // Count the number of Prediction_caches
     * const count = await prisma.prediction_cache.count({
     *   where: {
     *     // ... the filter for the Prediction_caches we want to count
     *   }
     * })
    **/
    count<T extends prediction_cacheCountArgs>(
      args?: Subset<T, prediction_cacheCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Prediction_cacheCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Prediction_cache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Prediction_cacheAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Prediction_cacheAggregateArgs>(args: Subset<T, Prediction_cacheAggregateArgs>): Prisma.PrismaPromise<GetPrediction_cacheAggregateType<T>>

    /**
     * Group by Prediction_cache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {prediction_cacheGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends prediction_cacheGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: prediction_cacheGroupByArgs['orderBy'] }
        : { orderBy?: prediction_cacheGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, prediction_cacheGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPrediction_cacheGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the prediction_cache model
   */
  readonly fields: prediction_cacheFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for prediction_cache.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__prediction_cacheClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the prediction_cache model
   */
  interface prediction_cacheFieldRefs {
    readonly id: FieldRef<"prediction_cache", 'String'>
    readonly zoneId: FieldRef<"prediction_cache", 'String'>
    readonly predictedTime: FieldRef<"prediction_cache", 'DateTime'>
    readonly predictedValue: FieldRef<"prediction_cache", 'Int'>
    readonly confidence: FieldRef<"prediction_cache", 'Float'>
    readonly generatedAt: FieldRef<"prediction_cache", 'DateTime'>
    readonly expiresAt: FieldRef<"prediction_cache", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * prediction_cache findUnique
   */
  export type prediction_cacheFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the prediction_cache
     */
    select?: prediction_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the prediction_cache
     */
    omit?: prediction_cacheOmit<ExtArgs> | null
    /**
     * Filter, which prediction_cache to fetch.
     */
    where: prediction_cacheWhereUniqueInput
  }

  /**
   * prediction_cache findUniqueOrThrow
   */
  export type prediction_cacheFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the prediction_cache
     */
    select?: prediction_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the prediction_cache
     */
    omit?: prediction_cacheOmit<ExtArgs> | null
    /**
     * Filter, which prediction_cache to fetch.
     */
    where: prediction_cacheWhereUniqueInput
  }

  /**
   * prediction_cache findFirst
   */
  export type prediction_cacheFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the prediction_cache
     */
    select?: prediction_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the prediction_cache
     */
    omit?: prediction_cacheOmit<ExtArgs> | null
    /**
     * Filter, which prediction_cache to fetch.
     */
    where?: prediction_cacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of prediction_caches to fetch.
     */
    orderBy?: prediction_cacheOrderByWithRelationInput | prediction_cacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for prediction_caches.
     */
    cursor?: prediction_cacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` prediction_caches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` prediction_caches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of prediction_caches.
     */
    distinct?: Prediction_cacheScalarFieldEnum | Prediction_cacheScalarFieldEnum[]
  }

  /**
   * prediction_cache findFirstOrThrow
   */
  export type prediction_cacheFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the prediction_cache
     */
    select?: prediction_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the prediction_cache
     */
    omit?: prediction_cacheOmit<ExtArgs> | null
    /**
     * Filter, which prediction_cache to fetch.
     */
    where?: prediction_cacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of prediction_caches to fetch.
     */
    orderBy?: prediction_cacheOrderByWithRelationInput | prediction_cacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for prediction_caches.
     */
    cursor?: prediction_cacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` prediction_caches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` prediction_caches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of prediction_caches.
     */
    distinct?: Prediction_cacheScalarFieldEnum | Prediction_cacheScalarFieldEnum[]
  }

  /**
   * prediction_cache findMany
   */
  export type prediction_cacheFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the prediction_cache
     */
    select?: prediction_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the prediction_cache
     */
    omit?: prediction_cacheOmit<ExtArgs> | null
    /**
     * Filter, which prediction_caches to fetch.
     */
    where?: prediction_cacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of prediction_caches to fetch.
     */
    orderBy?: prediction_cacheOrderByWithRelationInput | prediction_cacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing prediction_caches.
     */
    cursor?: prediction_cacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` prediction_caches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` prediction_caches.
     */
    skip?: number
    distinct?: Prediction_cacheScalarFieldEnum | Prediction_cacheScalarFieldEnum[]
  }

  /**
   * prediction_cache create
   */
  export type prediction_cacheCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the prediction_cache
     */
    select?: prediction_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the prediction_cache
     */
    omit?: prediction_cacheOmit<ExtArgs> | null
    /**
     * The data needed to create a prediction_cache.
     */
    data: XOR<prediction_cacheCreateInput, prediction_cacheUncheckedCreateInput>
  }

  /**
   * prediction_cache createMany
   */
  export type prediction_cacheCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many prediction_caches.
     */
    data: prediction_cacheCreateManyInput | prediction_cacheCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * prediction_cache createManyAndReturn
   */
  export type prediction_cacheCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the prediction_cache
     */
    select?: prediction_cacheSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the prediction_cache
     */
    omit?: prediction_cacheOmit<ExtArgs> | null
    /**
     * The data used to create many prediction_caches.
     */
    data: prediction_cacheCreateManyInput | prediction_cacheCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * prediction_cache update
   */
  export type prediction_cacheUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the prediction_cache
     */
    select?: prediction_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the prediction_cache
     */
    omit?: prediction_cacheOmit<ExtArgs> | null
    /**
     * The data needed to update a prediction_cache.
     */
    data: XOR<prediction_cacheUpdateInput, prediction_cacheUncheckedUpdateInput>
    /**
     * Choose, which prediction_cache to update.
     */
    where: prediction_cacheWhereUniqueInput
  }

  /**
   * prediction_cache updateMany
   */
  export type prediction_cacheUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update prediction_caches.
     */
    data: XOR<prediction_cacheUpdateManyMutationInput, prediction_cacheUncheckedUpdateManyInput>
    /**
     * Filter which prediction_caches to update
     */
    where?: prediction_cacheWhereInput
    /**
     * Limit how many prediction_caches to update.
     */
    limit?: number
  }

  /**
   * prediction_cache updateManyAndReturn
   */
  export type prediction_cacheUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the prediction_cache
     */
    select?: prediction_cacheSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the prediction_cache
     */
    omit?: prediction_cacheOmit<ExtArgs> | null
    /**
     * The data used to update prediction_caches.
     */
    data: XOR<prediction_cacheUpdateManyMutationInput, prediction_cacheUncheckedUpdateManyInput>
    /**
     * Filter which prediction_caches to update
     */
    where?: prediction_cacheWhereInput
    /**
     * Limit how many prediction_caches to update.
     */
    limit?: number
  }

  /**
   * prediction_cache upsert
   */
  export type prediction_cacheUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the prediction_cache
     */
    select?: prediction_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the prediction_cache
     */
    omit?: prediction_cacheOmit<ExtArgs> | null
    /**
     * The filter to search for the prediction_cache to update in case it exists.
     */
    where: prediction_cacheWhereUniqueInput
    /**
     * In case the prediction_cache found by the `where` argument doesn't exist, create a new prediction_cache with this data.
     */
    create: XOR<prediction_cacheCreateInput, prediction_cacheUncheckedCreateInput>
    /**
     * In case the prediction_cache was found with the provided `where` argument, update it with this data.
     */
    update: XOR<prediction_cacheUpdateInput, prediction_cacheUncheckedUpdateInput>
  }

  /**
   * prediction_cache delete
   */
  export type prediction_cacheDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the prediction_cache
     */
    select?: prediction_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the prediction_cache
     */
    omit?: prediction_cacheOmit<ExtArgs> | null
    /**
     * Filter which prediction_cache to delete.
     */
    where: prediction_cacheWhereUniqueInput
  }

  /**
   * prediction_cache deleteMany
   */
  export type prediction_cacheDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which prediction_caches to delete
     */
    where?: prediction_cacheWhereInput
    /**
     * Limit how many prediction_caches to delete.
     */
    limit?: number
  }

  /**
   * prediction_cache without action
   */
  export type prediction_cacheDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the prediction_cache
     */
    select?: prediction_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the prediction_cache
     */
    omit?: prediction_cacheOmit<ExtArgs> | null
  }


  /**
   * Model slots
   */

  export type AggregateSlots = {
    _count: SlotsCountAggregateOutputType | null
    _avg: SlotsAvgAggregateOutputType | null
    _sum: SlotsSumAggregateOutputType | null
    _min: SlotsMinAggregateOutputType | null
    _max: SlotsMaxAggregateOutputType | null
  }

  export type SlotsAvgAggregateOutputType = {
    capacity: number | null
    bookedCount: number | null
  }

  export type SlotsSumAggregateOutputType = {
    capacity: number | null
    bookedCount: number | null
  }

  export type SlotsMinAggregateOutputType = {
    id: string | null
    date: Date | null
    startTime: string | null
    endTime: string | null
    capacity: number | null
    bookedCount: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SlotsMaxAggregateOutputType = {
    id: string | null
    date: Date | null
    startTime: string | null
    endTime: string | null
    capacity: number | null
    bookedCount: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SlotsCountAggregateOutputType = {
    id: number
    date: number
    startTime: number
    endTime: number
    capacity: number
    bookedCount: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SlotsAvgAggregateInputType = {
    capacity?: true
    bookedCount?: true
  }

  export type SlotsSumAggregateInputType = {
    capacity?: true
    bookedCount?: true
  }

  export type SlotsMinAggregateInputType = {
    id?: true
    date?: true
    startTime?: true
    endTime?: true
    capacity?: true
    bookedCount?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SlotsMaxAggregateInputType = {
    id?: true
    date?: true
    startTime?: true
    endTime?: true
    capacity?: true
    bookedCount?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SlotsCountAggregateInputType = {
    id?: true
    date?: true
    startTime?: true
    endTime?: true
    capacity?: true
    bookedCount?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SlotsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which slots to aggregate.
     */
    where?: slotsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of slots to fetch.
     */
    orderBy?: slotsOrderByWithRelationInput | slotsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: slotsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` slots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` slots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned slots
    **/
    _count?: true | SlotsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SlotsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SlotsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SlotsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SlotsMaxAggregateInputType
  }

  export type GetSlotsAggregateType<T extends SlotsAggregateArgs> = {
        [P in keyof T & keyof AggregateSlots]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSlots[P]>
      : GetScalarType<T[P], AggregateSlots[P]>
  }




  export type slotsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: slotsWhereInput
    orderBy?: slotsOrderByWithAggregationInput | slotsOrderByWithAggregationInput[]
    by: SlotsScalarFieldEnum[] | SlotsScalarFieldEnum
    having?: slotsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SlotsCountAggregateInputType | true
    _avg?: SlotsAvgAggregateInputType
    _sum?: SlotsSumAggregateInputType
    _min?: SlotsMinAggregateInputType
    _max?: SlotsMaxAggregateInputType
  }

  export type SlotsGroupByOutputType = {
    id: string
    date: Date
    startTime: string
    endTime: string
    capacity: number
    bookedCount: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: SlotsCountAggregateOutputType | null
    _avg: SlotsAvgAggregateOutputType | null
    _sum: SlotsSumAggregateOutputType | null
    _min: SlotsMinAggregateOutputType | null
    _max: SlotsMaxAggregateOutputType | null
  }

  type GetSlotsGroupByPayload<T extends slotsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SlotsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SlotsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SlotsGroupByOutputType[P]>
            : GetScalarType<T[P], SlotsGroupByOutputType[P]>
        }
      >
    >


  export type slotsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    startTime?: boolean
    endTime?: boolean
    capacity?: boolean
    bookedCount?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    bookings?: boolean | slots$bookingsArgs<ExtArgs>
    user_bookings?: boolean | slots$user_bookingsArgs<ExtArgs>
    _count?: boolean | SlotsCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["slots"]>

  export type slotsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    startTime?: boolean
    endTime?: boolean
    capacity?: boolean
    bookedCount?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["slots"]>

  export type slotsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    startTime?: boolean
    endTime?: boolean
    capacity?: boolean
    bookedCount?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["slots"]>

  export type slotsSelectScalar = {
    id?: boolean
    date?: boolean
    startTime?: boolean
    endTime?: boolean
    capacity?: boolean
    bookedCount?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type slotsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "date" | "startTime" | "endTime" | "capacity" | "bookedCount" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["slots"]>
  export type slotsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | slots$bookingsArgs<ExtArgs>
    user_bookings?: boolean | slots$user_bookingsArgs<ExtArgs>
    _count?: boolean | SlotsCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type slotsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type slotsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $slotsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "slots"
    objects: {
      bookings: Prisma.$bookingsPayload<ExtArgs>[]
      user_bookings: Prisma.$user_bookingsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: Date
      startTime: string
      endTime: string
      capacity: number
      bookedCount: number
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["slots"]>
    composites: {}
  }

  type slotsGetPayload<S extends boolean | null | undefined | slotsDefaultArgs> = $Result.GetResult<Prisma.$slotsPayload, S>

  type slotsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<slotsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SlotsCountAggregateInputType | true
    }

  export interface slotsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['slots'], meta: { name: 'slots' } }
    /**
     * Find zero or one Slots that matches the filter.
     * @param {slotsFindUniqueArgs} args - Arguments to find a Slots
     * @example
     * // Get one Slots
     * const slots = await prisma.slots.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends slotsFindUniqueArgs>(args: SelectSubset<T, slotsFindUniqueArgs<ExtArgs>>): Prisma__slotsClient<$Result.GetResult<Prisma.$slotsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Slots that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {slotsFindUniqueOrThrowArgs} args - Arguments to find a Slots
     * @example
     * // Get one Slots
     * const slots = await prisma.slots.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends slotsFindUniqueOrThrowArgs>(args: SelectSubset<T, slotsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__slotsClient<$Result.GetResult<Prisma.$slotsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Slots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {slotsFindFirstArgs} args - Arguments to find a Slots
     * @example
     * // Get one Slots
     * const slots = await prisma.slots.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends slotsFindFirstArgs>(args?: SelectSubset<T, slotsFindFirstArgs<ExtArgs>>): Prisma__slotsClient<$Result.GetResult<Prisma.$slotsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Slots that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {slotsFindFirstOrThrowArgs} args - Arguments to find a Slots
     * @example
     * // Get one Slots
     * const slots = await prisma.slots.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends slotsFindFirstOrThrowArgs>(args?: SelectSubset<T, slotsFindFirstOrThrowArgs<ExtArgs>>): Prisma__slotsClient<$Result.GetResult<Prisma.$slotsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Slots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {slotsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Slots
     * const slots = await prisma.slots.findMany()
     * 
     * // Get first 10 Slots
     * const slots = await prisma.slots.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const slotsWithIdOnly = await prisma.slots.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends slotsFindManyArgs>(args?: SelectSubset<T, slotsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$slotsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Slots.
     * @param {slotsCreateArgs} args - Arguments to create a Slots.
     * @example
     * // Create one Slots
     * const Slots = await prisma.slots.create({
     *   data: {
     *     // ... data to create a Slots
     *   }
     * })
     * 
     */
    create<T extends slotsCreateArgs>(args: SelectSubset<T, slotsCreateArgs<ExtArgs>>): Prisma__slotsClient<$Result.GetResult<Prisma.$slotsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Slots.
     * @param {slotsCreateManyArgs} args - Arguments to create many Slots.
     * @example
     * // Create many Slots
     * const slots = await prisma.slots.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends slotsCreateManyArgs>(args?: SelectSubset<T, slotsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Slots and returns the data saved in the database.
     * @param {slotsCreateManyAndReturnArgs} args - Arguments to create many Slots.
     * @example
     * // Create many Slots
     * const slots = await prisma.slots.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Slots and only return the `id`
     * const slotsWithIdOnly = await prisma.slots.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends slotsCreateManyAndReturnArgs>(args?: SelectSubset<T, slotsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$slotsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Slots.
     * @param {slotsDeleteArgs} args - Arguments to delete one Slots.
     * @example
     * // Delete one Slots
     * const Slots = await prisma.slots.delete({
     *   where: {
     *     // ... filter to delete one Slots
     *   }
     * })
     * 
     */
    delete<T extends slotsDeleteArgs>(args: SelectSubset<T, slotsDeleteArgs<ExtArgs>>): Prisma__slotsClient<$Result.GetResult<Prisma.$slotsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Slots.
     * @param {slotsUpdateArgs} args - Arguments to update one Slots.
     * @example
     * // Update one Slots
     * const slots = await prisma.slots.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends slotsUpdateArgs>(args: SelectSubset<T, slotsUpdateArgs<ExtArgs>>): Prisma__slotsClient<$Result.GetResult<Prisma.$slotsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Slots.
     * @param {slotsDeleteManyArgs} args - Arguments to filter Slots to delete.
     * @example
     * // Delete a few Slots
     * const { count } = await prisma.slots.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends slotsDeleteManyArgs>(args?: SelectSubset<T, slotsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Slots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {slotsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Slots
     * const slots = await prisma.slots.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends slotsUpdateManyArgs>(args: SelectSubset<T, slotsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Slots and returns the data updated in the database.
     * @param {slotsUpdateManyAndReturnArgs} args - Arguments to update many Slots.
     * @example
     * // Update many Slots
     * const slots = await prisma.slots.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Slots and only return the `id`
     * const slotsWithIdOnly = await prisma.slots.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends slotsUpdateManyAndReturnArgs>(args: SelectSubset<T, slotsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$slotsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Slots.
     * @param {slotsUpsertArgs} args - Arguments to update or create a Slots.
     * @example
     * // Update or create a Slots
     * const slots = await prisma.slots.upsert({
     *   create: {
     *     // ... data to create a Slots
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Slots we want to update
     *   }
     * })
     */
    upsert<T extends slotsUpsertArgs>(args: SelectSubset<T, slotsUpsertArgs<ExtArgs>>): Prisma__slotsClient<$Result.GetResult<Prisma.$slotsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Slots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {slotsCountArgs} args - Arguments to filter Slots to count.
     * @example
     * // Count the number of Slots
     * const count = await prisma.slots.count({
     *   where: {
     *     // ... the filter for the Slots we want to count
     *   }
     * })
    **/
    count<T extends slotsCountArgs>(
      args?: Subset<T, slotsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SlotsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Slots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlotsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SlotsAggregateArgs>(args: Subset<T, SlotsAggregateArgs>): Prisma.PrismaPromise<GetSlotsAggregateType<T>>

    /**
     * Group by Slots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {slotsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends slotsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: slotsGroupByArgs['orderBy'] }
        : { orderBy?: slotsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, slotsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSlotsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the slots model
   */
  readonly fields: slotsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for slots.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__slotsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bookings<T extends slots$bookingsArgs<ExtArgs> = {}>(args?: Subset<T, slots$bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$bookingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    user_bookings<T extends slots$user_bookingsArgs<ExtArgs> = {}>(args?: Subset<T, slots$user_bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_bookingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the slots model
   */
  interface slotsFieldRefs {
    readonly id: FieldRef<"slots", 'String'>
    readonly date: FieldRef<"slots", 'DateTime'>
    readonly startTime: FieldRef<"slots", 'String'>
    readonly endTime: FieldRef<"slots", 'String'>
    readonly capacity: FieldRef<"slots", 'Int'>
    readonly bookedCount: FieldRef<"slots", 'Int'>
    readonly isActive: FieldRef<"slots", 'Boolean'>
    readonly createdAt: FieldRef<"slots", 'DateTime'>
    readonly updatedAt: FieldRef<"slots", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * slots findUnique
   */
  export type slotsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the slots
     */
    select?: slotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the slots
     */
    omit?: slotsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: slotsInclude<ExtArgs> | null
    /**
     * Filter, which slots to fetch.
     */
    where: slotsWhereUniqueInput
  }

  /**
   * slots findUniqueOrThrow
   */
  export type slotsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the slots
     */
    select?: slotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the slots
     */
    omit?: slotsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: slotsInclude<ExtArgs> | null
    /**
     * Filter, which slots to fetch.
     */
    where: slotsWhereUniqueInput
  }

  /**
   * slots findFirst
   */
  export type slotsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the slots
     */
    select?: slotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the slots
     */
    omit?: slotsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: slotsInclude<ExtArgs> | null
    /**
     * Filter, which slots to fetch.
     */
    where?: slotsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of slots to fetch.
     */
    orderBy?: slotsOrderByWithRelationInput | slotsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for slots.
     */
    cursor?: slotsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` slots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` slots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of slots.
     */
    distinct?: SlotsScalarFieldEnum | SlotsScalarFieldEnum[]
  }

  /**
   * slots findFirstOrThrow
   */
  export type slotsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the slots
     */
    select?: slotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the slots
     */
    omit?: slotsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: slotsInclude<ExtArgs> | null
    /**
     * Filter, which slots to fetch.
     */
    where?: slotsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of slots to fetch.
     */
    orderBy?: slotsOrderByWithRelationInput | slotsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for slots.
     */
    cursor?: slotsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` slots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` slots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of slots.
     */
    distinct?: SlotsScalarFieldEnum | SlotsScalarFieldEnum[]
  }

  /**
   * slots findMany
   */
  export type slotsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the slots
     */
    select?: slotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the slots
     */
    omit?: slotsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: slotsInclude<ExtArgs> | null
    /**
     * Filter, which slots to fetch.
     */
    where?: slotsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of slots to fetch.
     */
    orderBy?: slotsOrderByWithRelationInput | slotsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing slots.
     */
    cursor?: slotsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` slots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` slots.
     */
    skip?: number
    distinct?: SlotsScalarFieldEnum | SlotsScalarFieldEnum[]
  }

  /**
   * slots create
   */
  export type slotsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the slots
     */
    select?: slotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the slots
     */
    omit?: slotsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: slotsInclude<ExtArgs> | null
    /**
     * The data needed to create a slots.
     */
    data: XOR<slotsCreateInput, slotsUncheckedCreateInput>
  }

  /**
   * slots createMany
   */
  export type slotsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many slots.
     */
    data: slotsCreateManyInput | slotsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * slots createManyAndReturn
   */
  export type slotsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the slots
     */
    select?: slotsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the slots
     */
    omit?: slotsOmit<ExtArgs> | null
    /**
     * The data used to create many slots.
     */
    data: slotsCreateManyInput | slotsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * slots update
   */
  export type slotsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the slots
     */
    select?: slotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the slots
     */
    omit?: slotsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: slotsInclude<ExtArgs> | null
    /**
     * The data needed to update a slots.
     */
    data: XOR<slotsUpdateInput, slotsUncheckedUpdateInput>
    /**
     * Choose, which slots to update.
     */
    where: slotsWhereUniqueInput
  }

  /**
   * slots updateMany
   */
  export type slotsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update slots.
     */
    data: XOR<slotsUpdateManyMutationInput, slotsUncheckedUpdateManyInput>
    /**
     * Filter which slots to update
     */
    where?: slotsWhereInput
    /**
     * Limit how many slots to update.
     */
    limit?: number
  }

  /**
   * slots updateManyAndReturn
   */
  export type slotsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the slots
     */
    select?: slotsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the slots
     */
    omit?: slotsOmit<ExtArgs> | null
    /**
     * The data used to update slots.
     */
    data: XOR<slotsUpdateManyMutationInput, slotsUncheckedUpdateManyInput>
    /**
     * Filter which slots to update
     */
    where?: slotsWhereInput
    /**
     * Limit how many slots to update.
     */
    limit?: number
  }

  /**
   * slots upsert
   */
  export type slotsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the slots
     */
    select?: slotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the slots
     */
    omit?: slotsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: slotsInclude<ExtArgs> | null
    /**
     * The filter to search for the slots to update in case it exists.
     */
    where: slotsWhereUniqueInput
    /**
     * In case the slots found by the `where` argument doesn't exist, create a new slots with this data.
     */
    create: XOR<slotsCreateInput, slotsUncheckedCreateInput>
    /**
     * In case the slots was found with the provided `where` argument, update it with this data.
     */
    update: XOR<slotsUpdateInput, slotsUncheckedUpdateInput>
  }

  /**
   * slots delete
   */
  export type slotsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the slots
     */
    select?: slotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the slots
     */
    omit?: slotsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: slotsInclude<ExtArgs> | null
    /**
     * Filter which slots to delete.
     */
    where: slotsWhereUniqueInput
  }

  /**
   * slots deleteMany
   */
  export type slotsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which slots to delete
     */
    where?: slotsWhereInput
    /**
     * Limit how many slots to delete.
     */
    limit?: number
  }

  /**
   * slots.bookings
   */
  export type slots$bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the bookings
     */
    select?: bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the bookings
     */
    omit?: bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: bookingsInclude<ExtArgs> | null
    where?: bookingsWhereInput
    orderBy?: bookingsOrderByWithRelationInput | bookingsOrderByWithRelationInput[]
    cursor?: bookingsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BookingsScalarFieldEnum | BookingsScalarFieldEnum[]
  }

  /**
   * slots.user_bookings
   */
  export type slots$user_bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_bookings
     */
    select?: user_bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_bookings
     */
    omit?: user_bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_bookingsInclude<ExtArgs> | null
    where?: user_bookingsWhereInput
    orderBy?: user_bookingsOrderByWithRelationInput | user_bookingsOrderByWithRelationInput[]
    cursor?: user_bookingsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: User_bookingsScalarFieldEnum | User_bookingsScalarFieldEnum[]
  }

  /**
   * slots without action
   */
  export type slotsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the slots
     */
    select?: slotsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the slots
     */
    omit?: slotsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: slotsInclude<ExtArgs> | null
  }


  /**
   * Model sos_alerts
   */

  export type AggregateSos_alerts = {
    _count: Sos_alertsCountAggregateOutputType | null
    _avg: Sos_alertsAvgAggregateOutputType | null
    _sum: Sos_alertsSumAggregateOutputType | null
    _min: Sos_alertsMinAggregateOutputType | null
    _max: Sos_alertsMaxAggregateOutputType | null
  }

  export type Sos_alertsAvgAggregateOutputType = {
    latitude: number | null
    longitude: number | null
  }

  export type Sos_alertsSumAggregateOutputType = {
    latitude: number | null
    longitude: number | null
  }

  export type Sos_alertsMinAggregateOutputType = {
    id: string | null
    userId: string | null
    userName: string | null
    userPhone: string | null
    userEmail: string | null
    latitude: number | null
    longitude: number | null
    manualLocation: string | null
    message: string | null
    emergencyType: string | null
    status: string | null
    resolvedAt: Date | null
    resolvedBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Sos_alertsMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    userName: string | null
    userPhone: string | null
    userEmail: string | null
    latitude: number | null
    longitude: number | null
    manualLocation: string | null
    message: string | null
    emergencyType: string | null
    status: string | null
    resolvedAt: Date | null
    resolvedBy: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Sos_alertsCountAggregateOutputType = {
    id: number
    userId: number
    userName: number
    userPhone: number
    userEmail: number
    latitude: number
    longitude: number
    manualLocation: number
    message: number
    emergencyType: number
    status: number
    resolvedAt: number
    resolvedBy: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type Sos_alertsAvgAggregateInputType = {
    latitude?: true
    longitude?: true
  }

  export type Sos_alertsSumAggregateInputType = {
    latitude?: true
    longitude?: true
  }

  export type Sos_alertsMinAggregateInputType = {
    id?: true
    userId?: true
    userName?: true
    userPhone?: true
    userEmail?: true
    latitude?: true
    longitude?: true
    manualLocation?: true
    message?: true
    emergencyType?: true
    status?: true
    resolvedAt?: true
    resolvedBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Sos_alertsMaxAggregateInputType = {
    id?: true
    userId?: true
    userName?: true
    userPhone?: true
    userEmail?: true
    latitude?: true
    longitude?: true
    manualLocation?: true
    message?: true
    emergencyType?: true
    status?: true
    resolvedAt?: true
    resolvedBy?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Sos_alertsCountAggregateInputType = {
    id?: true
    userId?: true
    userName?: true
    userPhone?: true
    userEmail?: true
    latitude?: true
    longitude?: true
    manualLocation?: true
    message?: true
    emergencyType?: true
    status?: true
    resolvedAt?: true
    resolvedBy?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type Sos_alertsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which sos_alerts to aggregate.
     */
    where?: sos_alertsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sos_alerts to fetch.
     */
    orderBy?: sos_alertsOrderByWithRelationInput | sos_alertsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: sos_alertsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sos_alerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sos_alerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned sos_alerts
    **/
    _count?: true | Sos_alertsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Sos_alertsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Sos_alertsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Sos_alertsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Sos_alertsMaxAggregateInputType
  }

  export type GetSos_alertsAggregateType<T extends Sos_alertsAggregateArgs> = {
        [P in keyof T & keyof AggregateSos_alerts]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSos_alerts[P]>
      : GetScalarType<T[P], AggregateSos_alerts[P]>
  }




  export type sos_alertsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: sos_alertsWhereInput
    orderBy?: sos_alertsOrderByWithAggregationInput | sos_alertsOrderByWithAggregationInput[]
    by: Sos_alertsScalarFieldEnum[] | Sos_alertsScalarFieldEnum
    having?: sos_alertsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Sos_alertsCountAggregateInputType | true
    _avg?: Sos_alertsAvgAggregateInputType
    _sum?: Sos_alertsSumAggregateInputType
    _min?: Sos_alertsMinAggregateInputType
    _max?: Sos_alertsMaxAggregateInputType
  }

  export type Sos_alertsGroupByOutputType = {
    id: string
    userId: string | null
    userName: string | null
    userPhone: string | null
    userEmail: string | null
    latitude: number | null
    longitude: number | null
    manualLocation: string | null
    message: string | null
    emergencyType: string
    status: string
    resolvedAt: Date | null
    resolvedBy: string | null
    createdAt: Date
    updatedAt: Date
    _count: Sos_alertsCountAggregateOutputType | null
    _avg: Sos_alertsAvgAggregateOutputType | null
    _sum: Sos_alertsSumAggregateOutputType | null
    _min: Sos_alertsMinAggregateOutputType | null
    _max: Sos_alertsMaxAggregateOutputType | null
  }

  type GetSos_alertsGroupByPayload<T extends sos_alertsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Sos_alertsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Sos_alertsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Sos_alertsGroupByOutputType[P]>
            : GetScalarType<T[P], Sos_alertsGroupByOutputType[P]>
        }
      >
    >


  export type sos_alertsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    userName?: boolean
    userPhone?: boolean
    userEmail?: boolean
    latitude?: boolean
    longitude?: boolean
    manualLocation?: boolean
    message?: boolean
    emergencyType?: boolean
    status?: boolean
    resolvedAt?: boolean
    resolvedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    users?: boolean | sos_alerts$usersArgs<ExtArgs>
  }, ExtArgs["result"]["sos_alerts"]>

  export type sos_alertsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    userName?: boolean
    userPhone?: boolean
    userEmail?: boolean
    latitude?: boolean
    longitude?: boolean
    manualLocation?: boolean
    message?: boolean
    emergencyType?: boolean
    status?: boolean
    resolvedAt?: boolean
    resolvedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    users?: boolean | sos_alerts$usersArgs<ExtArgs>
  }, ExtArgs["result"]["sos_alerts"]>

  export type sos_alertsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    userName?: boolean
    userPhone?: boolean
    userEmail?: boolean
    latitude?: boolean
    longitude?: boolean
    manualLocation?: boolean
    message?: boolean
    emergencyType?: boolean
    status?: boolean
    resolvedAt?: boolean
    resolvedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    users?: boolean | sos_alerts$usersArgs<ExtArgs>
  }, ExtArgs["result"]["sos_alerts"]>

  export type sos_alertsSelectScalar = {
    id?: boolean
    userId?: boolean
    userName?: boolean
    userPhone?: boolean
    userEmail?: boolean
    latitude?: boolean
    longitude?: boolean
    manualLocation?: boolean
    message?: boolean
    emergencyType?: boolean
    status?: boolean
    resolvedAt?: boolean
    resolvedBy?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type sos_alertsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "userName" | "userPhone" | "userEmail" | "latitude" | "longitude" | "manualLocation" | "message" | "emergencyType" | "status" | "resolvedAt" | "resolvedBy" | "createdAt" | "updatedAt", ExtArgs["result"]["sos_alerts"]>
  export type sos_alertsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | sos_alerts$usersArgs<ExtArgs>
  }
  export type sos_alertsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | sos_alerts$usersArgs<ExtArgs>
  }
  export type sos_alertsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | sos_alerts$usersArgs<ExtArgs>
  }

  export type $sos_alertsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "sos_alerts"
    objects: {
      users: Prisma.$usersPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string | null
      userName: string | null
      userPhone: string | null
      userEmail: string | null
      latitude: number | null
      longitude: number | null
      manualLocation: string | null
      message: string | null
      emergencyType: string
      status: string
      resolvedAt: Date | null
      resolvedBy: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["sos_alerts"]>
    composites: {}
  }

  type sos_alertsGetPayload<S extends boolean | null | undefined | sos_alertsDefaultArgs> = $Result.GetResult<Prisma.$sos_alertsPayload, S>

  type sos_alertsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<sos_alertsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Sos_alertsCountAggregateInputType | true
    }

  export interface sos_alertsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['sos_alerts'], meta: { name: 'sos_alerts' } }
    /**
     * Find zero or one Sos_alerts that matches the filter.
     * @param {sos_alertsFindUniqueArgs} args - Arguments to find a Sos_alerts
     * @example
     * // Get one Sos_alerts
     * const sos_alerts = await prisma.sos_alerts.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends sos_alertsFindUniqueArgs>(args: SelectSubset<T, sos_alertsFindUniqueArgs<ExtArgs>>): Prisma__sos_alertsClient<$Result.GetResult<Prisma.$sos_alertsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Sos_alerts that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {sos_alertsFindUniqueOrThrowArgs} args - Arguments to find a Sos_alerts
     * @example
     * // Get one Sos_alerts
     * const sos_alerts = await prisma.sos_alerts.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends sos_alertsFindUniqueOrThrowArgs>(args: SelectSubset<T, sos_alertsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__sos_alertsClient<$Result.GetResult<Prisma.$sos_alertsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sos_alerts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sos_alertsFindFirstArgs} args - Arguments to find a Sos_alerts
     * @example
     * // Get one Sos_alerts
     * const sos_alerts = await prisma.sos_alerts.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends sos_alertsFindFirstArgs>(args?: SelectSubset<T, sos_alertsFindFirstArgs<ExtArgs>>): Prisma__sos_alertsClient<$Result.GetResult<Prisma.$sos_alertsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sos_alerts that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sos_alertsFindFirstOrThrowArgs} args - Arguments to find a Sos_alerts
     * @example
     * // Get one Sos_alerts
     * const sos_alerts = await prisma.sos_alerts.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends sos_alertsFindFirstOrThrowArgs>(args?: SelectSubset<T, sos_alertsFindFirstOrThrowArgs<ExtArgs>>): Prisma__sos_alertsClient<$Result.GetResult<Prisma.$sos_alertsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sos_alerts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sos_alertsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sos_alerts
     * const sos_alerts = await prisma.sos_alerts.findMany()
     * 
     * // Get first 10 Sos_alerts
     * const sos_alerts = await prisma.sos_alerts.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sos_alertsWithIdOnly = await prisma.sos_alerts.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends sos_alertsFindManyArgs>(args?: SelectSubset<T, sos_alertsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$sos_alertsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Sos_alerts.
     * @param {sos_alertsCreateArgs} args - Arguments to create a Sos_alerts.
     * @example
     * // Create one Sos_alerts
     * const Sos_alerts = await prisma.sos_alerts.create({
     *   data: {
     *     // ... data to create a Sos_alerts
     *   }
     * })
     * 
     */
    create<T extends sos_alertsCreateArgs>(args: SelectSubset<T, sos_alertsCreateArgs<ExtArgs>>): Prisma__sos_alertsClient<$Result.GetResult<Prisma.$sos_alertsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sos_alerts.
     * @param {sos_alertsCreateManyArgs} args - Arguments to create many Sos_alerts.
     * @example
     * // Create many Sos_alerts
     * const sos_alerts = await prisma.sos_alerts.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends sos_alertsCreateManyArgs>(args?: SelectSubset<T, sos_alertsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sos_alerts and returns the data saved in the database.
     * @param {sos_alertsCreateManyAndReturnArgs} args - Arguments to create many Sos_alerts.
     * @example
     * // Create many Sos_alerts
     * const sos_alerts = await prisma.sos_alerts.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sos_alerts and only return the `id`
     * const sos_alertsWithIdOnly = await prisma.sos_alerts.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends sos_alertsCreateManyAndReturnArgs>(args?: SelectSubset<T, sos_alertsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$sos_alertsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Sos_alerts.
     * @param {sos_alertsDeleteArgs} args - Arguments to delete one Sos_alerts.
     * @example
     * // Delete one Sos_alerts
     * const Sos_alerts = await prisma.sos_alerts.delete({
     *   where: {
     *     // ... filter to delete one Sos_alerts
     *   }
     * })
     * 
     */
    delete<T extends sos_alertsDeleteArgs>(args: SelectSubset<T, sos_alertsDeleteArgs<ExtArgs>>): Prisma__sos_alertsClient<$Result.GetResult<Prisma.$sos_alertsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Sos_alerts.
     * @param {sos_alertsUpdateArgs} args - Arguments to update one Sos_alerts.
     * @example
     * // Update one Sos_alerts
     * const sos_alerts = await prisma.sos_alerts.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends sos_alertsUpdateArgs>(args: SelectSubset<T, sos_alertsUpdateArgs<ExtArgs>>): Prisma__sos_alertsClient<$Result.GetResult<Prisma.$sos_alertsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sos_alerts.
     * @param {sos_alertsDeleteManyArgs} args - Arguments to filter Sos_alerts to delete.
     * @example
     * // Delete a few Sos_alerts
     * const { count } = await prisma.sos_alerts.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends sos_alertsDeleteManyArgs>(args?: SelectSubset<T, sos_alertsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sos_alerts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sos_alertsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sos_alerts
     * const sos_alerts = await prisma.sos_alerts.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends sos_alertsUpdateManyArgs>(args: SelectSubset<T, sos_alertsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sos_alerts and returns the data updated in the database.
     * @param {sos_alertsUpdateManyAndReturnArgs} args - Arguments to update many Sos_alerts.
     * @example
     * // Update many Sos_alerts
     * const sos_alerts = await prisma.sos_alerts.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sos_alerts and only return the `id`
     * const sos_alertsWithIdOnly = await prisma.sos_alerts.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends sos_alertsUpdateManyAndReturnArgs>(args: SelectSubset<T, sos_alertsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$sos_alertsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Sos_alerts.
     * @param {sos_alertsUpsertArgs} args - Arguments to update or create a Sos_alerts.
     * @example
     * // Update or create a Sos_alerts
     * const sos_alerts = await prisma.sos_alerts.upsert({
     *   create: {
     *     // ... data to create a Sos_alerts
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Sos_alerts we want to update
     *   }
     * })
     */
    upsert<T extends sos_alertsUpsertArgs>(args: SelectSubset<T, sos_alertsUpsertArgs<ExtArgs>>): Prisma__sos_alertsClient<$Result.GetResult<Prisma.$sos_alertsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sos_alerts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sos_alertsCountArgs} args - Arguments to filter Sos_alerts to count.
     * @example
     * // Count the number of Sos_alerts
     * const count = await prisma.sos_alerts.count({
     *   where: {
     *     // ... the filter for the Sos_alerts we want to count
     *   }
     * })
    **/
    count<T extends sos_alertsCountArgs>(
      args?: Subset<T, sos_alertsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Sos_alertsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Sos_alerts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Sos_alertsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Sos_alertsAggregateArgs>(args: Subset<T, Sos_alertsAggregateArgs>): Prisma.PrismaPromise<GetSos_alertsAggregateType<T>>

    /**
     * Group by Sos_alerts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sos_alertsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends sos_alertsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: sos_alertsGroupByArgs['orderBy'] }
        : { orderBy?: sos_alertsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, sos_alertsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSos_alertsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the sos_alerts model
   */
  readonly fields: sos_alertsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for sos_alerts.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__sos_alertsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends sos_alerts$usersArgs<ExtArgs> = {}>(args?: Subset<T, sos_alerts$usersArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the sos_alerts model
   */
  interface sos_alertsFieldRefs {
    readonly id: FieldRef<"sos_alerts", 'String'>
    readonly userId: FieldRef<"sos_alerts", 'String'>
    readonly userName: FieldRef<"sos_alerts", 'String'>
    readonly userPhone: FieldRef<"sos_alerts", 'String'>
    readonly userEmail: FieldRef<"sos_alerts", 'String'>
    readonly latitude: FieldRef<"sos_alerts", 'Float'>
    readonly longitude: FieldRef<"sos_alerts", 'Float'>
    readonly manualLocation: FieldRef<"sos_alerts", 'String'>
    readonly message: FieldRef<"sos_alerts", 'String'>
    readonly emergencyType: FieldRef<"sos_alerts", 'String'>
    readonly status: FieldRef<"sos_alerts", 'String'>
    readonly resolvedAt: FieldRef<"sos_alerts", 'DateTime'>
    readonly resolvedBy: FieldRef<"sos_alerts", 'String'>
    readonly createdAt: FieldRef<"sos_alerts", 'DateTime'>
    readonly updatedAt: FieldRef<"sos_alerts", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * sos_alerts findUnique
   */
  export type sos_alertsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sos_alerts
     */
    select?: sos_alertsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sos_alerts
     */
    omit?: sos_alertsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sos_alertsInclude<ExtArgs> | null
    /**
     * Filter, which sos_alerts to fetch.
     */
    where: sos_alertsWhereUniqueInput
  }

  /**
   * sos_alerts findUniqueOrThrow
   */
  export type sos_alertsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sos_alerts
     */
    select?: sos_alertsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sos_alerts
     */
    omit?: sos_alertsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sos_alertsInclude<ExtArgs> | null
    /**
     * Filter, which sos_alerts to fetch.
     */
    where: sos_alertsWhereUniqueInput
  }

  /**
   * sos_alerts findFirst
   */
  export type sos_alertsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sos_alerts
     */
    select?: sos_alertsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sos_alerts
     */
    omit?: sos_alertsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sos_alertsInclude<ExtArgs> | null
    /**
     * Filter, which sos_alerts to fetch.
     */
    where?: sos_alertsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sos_alerts to fetch.
     */
    orderBy?: sos_alertsOrderByWithRelationInput | sos_alertsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for sos_alerts.
     */
    cursor?: sos_alertsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sos_alerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sos_alerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of sos_alerts.
     */
    distinct?: Sos_alertsScalarFieldEnum | Sos_alertsScalarFieldEnum[]
  }

  /**
   * sos_alerts findFirstOrThrow
   */
  export type sos_alertsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sos_alerts
     */
    select?: sos_alertsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sos_alerts
     */
    omit?: sos_alertsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sos_alertsInclude<ExtArgs> | null
    /**
     * Filter, which sos_alerts to fetch.
     */
    where?: sos_alertsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sos_alerts to fetch.
     */
    orderBy?: sos_alertsOrderByWithRelationInput | sos_alertsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for sos_alerts.
     */
    cursor?: sos_alertsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sos_alerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sos_alerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of sos_alerts.
     */
    distinct?: Sos_alertsScalarFieldEnum | Sos_alertsScalarFieldEnum[]
  }

  /**
   * sos_alerts findMany
   */
  export type sos_alertsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sos_alerts
     */
    select?: sos_alertsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sos_alerts
     */
    omit?: sos_alertsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sos_alertsInclude<ExtArgs> | null
    /**
     * Filter, which sos_alerts to fetch.
     */
    where?: sos_alertsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sos_alerts to fetch.
     */
    orderBy?: sos_alertsOrderByWithRelationInput | sos_alertsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing sos_alerts.
     */
    cursor?: sos_alertsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sos_alerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sos_alerts.
     */
    skip?: number
    distinct?: Sos_alertsScalarFieldEnum | Sos_alertsScalarFieldEnum[]
  }

  /**
   * sos_alerts create
   */
  export type sos_alertsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sos_alerts
     */
    select?: sos_alertsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sos_alerts
     */
    omit?: sos_alertsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sos_alertsInclude<ExtArgs> | null
    /**
     * The data needed to create a sos_alerts.
     */
    data: XOR<sos_alertsCreateInput, sos_alertsUncheckedCreateInput>
  }

  /**
   * sos_alerts createMany
   */
  export type sos_alertsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many sos_alerts.
     */
    data: sos_alertsCreateManyInput | sos_alertsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * sos_alerts createManyAndReturn
   */
  export type sos_alertsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sos_alerts
     */
    select?: sos_alertsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the sos_alerts
     */
    omit?: sos_alertsOmit<ExtArgs> | null
    /**
     * The data used to create many sos_alerts.
     */
    data: sos_alertsCreateManyInput | sos_alertsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sos_alertsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * sos_alerts update
   */
  export type sos_alertsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sos_alerts
     */
    select?: sos_alertsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sos_alerts
     */
    omit?: sos_alertsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sos_alertsInclude<ExtArgs> | null
    /**
     * The data needed to update a sos_alerts.
     */
    data: XOR<sos_alertsUpdateInput, sos_alertsUncheckedUpdateInput>
    /**
     * Choose, which sos_alerts to update.
     */
    where: sos_alertsWhereUniqueInput
  }

  /**
   * sos_alerts updateMany
   */
  export type sos_alertsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update sos_alerts.
     */
    data: XOR<sos_alertsUpdateManyMutationInput, sos_alertsUncheckedUpdateManyInput>
    /**
     * Filter which sos_alerts to update
     */
    where?: sos_alertsWhereInput
    /**
     * Limit how many sos_alerts to update.
     */
    limit?: number
  }

  /**
   * sos_alerts updateManyAndReturn
   */
  export type sos_alertsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sos_alerts
     */
    select?: sos_alertsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the sos_alerts
     */
    omit?: sos_alertsOmit<ExtArgs> | null
    /**
     * The data used to update sos_alerts.
     */
    data: XOR<sos_alertsUpdateManyMutationInput, sos_alertsUncheckedUpdateManyInput>
    /**
     * Filter which sos_alerts to update
     */
    where?: sos_alertsWhereInput
    /**
     * Limit how many sos_alerts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sos_alertsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * sos_alerts upsert
   */
  export type sos_alertsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sos_alerts
     */
    select?: sos_alertsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sos_alerts
     */
    omit?: sos_alertsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sos_alertsInclude<ExtArgs> | null
    /**
     * The filter to search for the sos_alerts to update in case it exists.
     */
    where: sos_alertsWhereUniqueInput
    /**
     * In case the sos_alerts found by the `where` argument doesn't exist, create a new sos_alerts with this data.
     */
    create: XOR<sos_alertsCreateInput, sos_alertsUncheckedCreateInput>
    /**
     * In case the sos_alerts was found with the provided `where` argument, update it with this data.
     */
    update: XOR<sos_alertsUpdateInput, sos_alertsUncheckedUpdateInput>
  }

  /**
   * sos_alerts delete
   */
  export type sos_alertsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sos_alerts
     */
    select?: sos_alertsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sos_alerts
     */
    omit?: sos_alertsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sos_alertsInclude<ExtArgs> | null
    /**
     * Filter which sos_alerts to delete.
     */
    where: sos_alertsWhereUniqueInput
  }

  /**
   * sos_alerts deleteMany
   */
  export type sos_alertsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which sos_alerts to delete
     */
    where?: sos_alertsWhereInput
    /**
     * Limit how many sos_alerts to delete.
     */
    limit?: number
  }

  /**
   * sos_alerts.users
   */
  export type sos_alerts$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    where?: usersWhereInput
  }

  /**
   * sos_alerts without action
   */
  export type sos_alertsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sos_alerts
     */
    select?: sos_alertsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sos_alerts
     */
    omit?: sos_alertsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sos_alertsInclude<ExtArgs> | null
  }


  /**
   * Model user_bookings
   */

  export type AggregateUser_bookings = {
    _count: User_bookingsCountAggregateOutputType | null
    _avg: User_bookingsAvgAggregateOutputType | null
    _sum: User_bookingsSumAggregateOutputType | null
    _min: User_bookingsMinAggregateOutputType | null
    _max: User_bookingsMaxAggregateOutputType | null
  }

  export type User_bookingsAvgAggregateOutputType = {
    numberOfPeople: number | null
  }

  export type User_bookingsSumAggregateOutputType = {
    numberOfPeople: number | null
  }

  export type User_bookingsMinAggregateOutputType = {
    id: string | null
    userId: string | null
    slotId: string | null
    numberOfPeople: number | null
    qrCode: string | null
    status: string | null
    checkedInAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type User_bookingsMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    slotId: string | null
    numberOfPeople: number | null
    qrCode: string | null
    status: string | null
    checkedInAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type User_bookingsCountAggregateOutputType = {
    id: number
    userId: number
    slotId: number
    numberOfPeople: number
    qrCode: number
    status: number
    checkedInAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type User_bookingsAvgAggregateInputType = {
    numberOfPeople?: true
  }

  export type User_bookingsSumAggregateInputType = {
    numberOfPeople?: true
  }

  export type User_bookingsMinAggregateInputType = {
    id?: true
    userId?: true
    slotId?: true
    numberOfPeople?: true
    qrCode?: true
    status?: true
    checkedInAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type User_bookingsMaxAggregateInputType = {
    id?: true
    userId?: true
    slotId?: true
    numberOfPeople?: true
    qrCode?: true
    status?: true
    checkedInAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type User_bookingsCountAggregateInputType = {
    id?: true
    userId?: true
    slotId?: true
    numberOfPeople?: true
    qrCode?: true
    status?: true
    checkedInAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type User_bookingsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which user_bookings to aggregate.
     */
    where?: user_bookingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_bookings to fetch.
     */
    orderBy?: user_bookingsOrderByWithRelationInput | user_bookingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: user_bookingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned user_bookings
    **/
    _count?: true | User_bookingsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: User_bookingsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: User_bookingsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: User_bookingsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: User_bookingsMaxAggregateInputType
  }

  export type GetUser_bookingsAggregateType<T extends User_bookingsAggregateArgs> = {
        [P in keyof T & keyof AggregateUser_bookings]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser_bookings[P]>
      : GetScalarType<T[P], AggregateUser_bookings[P]>
  }




  export type user_bookingsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: user_bookingsWhereInput
    orderBy?: user_bookingsOrderByWithAggregationInput | user_bookingsOrderByWithAggregationInput[]
    by: User_bookingsScalarFieldEnum[] | User_bookingsScalarFieldEnum
    having?: user_bookingsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: User_bookingsCountAggregateInputType | true
    _avg?: User_bookingsAvgAggregateInputType
    _sum?: User_bookingsSumAggregateInputType
    _min?: User_bookingsMinAggregateInputType
    _max?: User_bookingsMaxAggregateInputType
  }

  export type User_bookingsGroupByOutputType = {
    id: string
    userId: string
    slotId: string
    numberOfPeople: number
    qrCode: string
    status: string
    checkedInAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: User_bookingsCountAggregateOutputType | null
    _avg: User_bookingsAvgAggregateOutputType | null
    _sum: User_bookingsSumAggregateOutputType | null
    _min: User_bookingsMinAggregateOutputType | null
    _max: User_bookingsMaxAggregateOutputType | null
  }

  type GetUser_bookingsGroupByPayload<T extends user_bookingsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<User_bookingsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof User_bookingsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], User_bookingsGroupByOutputType[P]>
            : GetScalarType<T[P], User_bookingsGroupByOutputType[P]>
        }
      >
    >


  export type user_bookingsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    slotId?: boolean
    numberOfPeople?: boolean
    qrCode?: boolean
    status?: boolean
    checkedInAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    slots?: boolean | slotsDefaultArgs<ExtArgs>
    users?: boolean | usersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user_bookings"]>

  export type user_bookingsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    slotId?: boolean
    numberOfPeople?: boolean
    qrCode?: boolean
    status?: boolean
    checkedInAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    slots?: boolean | slotsDefaultArgs<ExtArgs>
    users?: boolean | usersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user_bookings"]>

  export type user_bookingsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    slotId?: boolean
    numberOfPeople?: boolean
    qrCode?: boolean
    status?: boolean
    checkedInAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    slots?: boolean | slotsDefaultArgs<ExtArgs>
    users?: boolean | usersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user_bookings"]>

  export type user_bookingsSelectScalar = {
    id?: boolean
    userId?: boolean
    slotId?: boolean
    numberOfPeople?: boolean
    qrCode?: boolean
    status?: boolean
    checkedInAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type user_bookingsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "slotId" | "numberOfPeople" | "qrCode" | "status" | "checkedInAt" | "createdAt" | "updatedAt", ExtArgs["result"]["user_bookings"]>
  export type user_bookingsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    slots?: boolean | slotsDefaultArgs<ExtArgs>
    users?: boolean | usersDefaultArgs<ExtArgs>
  }
  export type user_bookingsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    slots?: boolean | slotsDefaultArgs<ExtArgs>
    users?: boolean | usersDefaultArgs<ExtArgs>
  }
  export type user_bookingsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    slots?: boolean | slotsDefaultArgs<ExtArgs>
    users?: boolean | usersDefaultArgs<ExtArgs>
  }

  export type $user_bookingsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "user_bookings"
    objects: {
      slots: Prisma.$slotsPayload<ExtArgs>
      users: Prisma.$usersPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      slotId: string
      numberOfPeople: number
      qrCode: string
      status: string
      checkedInAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user_bookings"]>
    composites: {}
  }

  type user_bookingsGetPayload<S extends boolean | null | undefined | user_bookingsDefaultArgs> = $Result.GetResult<Prisma.$user_bookingsPayload, S>

  type user_bookingsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<user_bookingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: User_bookingsCountAggregateInputType | true
    }

  export interface user_bookingsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['user_bookings'], meta: { name: 'user_bookings' } }
    /**
     * Find zero or one User_bookings that matches the filter.
     * @param {user_bookingsFindUniqueArgs} args - Arguments to find a User_bookings
     * @example
     * // Get one User_bookings
     * const user_bookings = await prisma.user_bookings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends user_bookingsFindUniqueArgs>(args: SelectSubset<T, user_bookingsFindUniqueArgs<ExtArgs>>): Prisma__user_bookingsClient<$Result.GetResult<Prisma.$user_bookingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User_bookings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {user_bookingsFindUniqueOrThrowArgs} args - Arguments to find a User_bookings
     * @example
     * // Get one User_bookings
     * const user_bookings = await prisma.user_bookings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends user_bookingsFindUniqueOrThrowArgs>(args: SelectSubset<T, user_bookingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__user_bookingsClient<$Result.GetResult<Prisma.$user_bookingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User_bookings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_bookingsFindFirstArgs} args - Arguments to find a User_bookings
     * @example
     * // Get one User_bookings
     * const user_bookings = await prisma.user_bookings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends user_bookingsFindFirstArgs>(args?: SelectSubset<T, user_bookingsFindFirstArgs<ExtArgs>>): Prisma__user_bookingsClient<$Result.GetResult<Prisma.$user_bookingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User_bookings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_bookingsFindFirstOrThrowArgs} args - Arguments to find a User_bookings
     * @example
     * // Get one User_bookings
     * const user_bookings = await prisma.user_bookings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends user_bookingsFindFirstOrThrowArgs>(args?: SelectSubset<T, user_bookingsFindFirstOrThrowArgs<ExtArgs>>): Prisma__user_bookingsClient<$Result.GetResult<Prisma.$user_bookingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more User_bookings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_bookingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all User_bookings
     * const user_bookings = await prisma.user_bookings.findMany()
     * 
     * // Get first 10 User_bookings
     * const user_bookings = await prisma.user_bookings.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const user_bookingsWithIdOnly = await prisma.user_bookings.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends user_bookingsFindManyArgs>(args?: SelectSubset<T, user_bookingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_bookingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User_bookings.
     * @param {user_bookingsCreateArgs} args - Arguments to create a User_bookings.
     * @example
     * // Create one User_bookings
     * const User_bookings = await prisma.user_bookings.create({
     *   data: {
     *     // ... data to create a User_bookings
     *   }
     * })
     * 
     */
    create<T extends user_bookingsCreateArgs>(args: SelectSubset<T, user_bookingsCreateArgs<ExtArgs>>): Prisma__user_bookingsClient<$Result.GetResult<Prisma.$user_bookingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many User_bookings.
     * @param {user_bookingsCreateManyArgs} args - Arguments to create many User_bookings.
     * @example
     * // Create many User_bookings
     * const user_bookings = await prisma.user_bookings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends user_bookingsCreateManyArgs>(args?: SelectSubset<T, user_bookingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many User_bookings and returns the data saved in the database.
     * @param {user_bookingsCreateManyAndReturnArgs} args - Arguments to create many User_bookings.
     * @example
     * // Create many User_bookings
     * const user_bookings = await prisma.user_bookings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many User_bookings and only return the `id`
     * const user_bookingsWithIdOnly = await prisma.user_bookings.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends user_bookingsCreateManyAndReturnArgs>(args?: SelectSubset<T, user_bookingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_bookingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User_bookings.
     * @param {user_bookingsDeleteArgs} args - Arguments to delete one User_bookings.
     * @example
     * // Delete one User_bookings
     * const User_bookings = await prisma.user_bookings.delete({
     *   where: {
     *     // ... filter to delete one User_bookings
     *   }
     * })
     * 
     */
    delete<T extends user_bookingsDeleteArgs>(args: SelectSubset<T, user_bookingsDeleteArgs<ExtArgs>>): Prisma__user_bookingsClient<$Result.GetResult<Prisma.$user_bookingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User_bookings.
     * @param {user_bookingsUpdateArgs} args - Arguments to update one User_bookings.
     * @example
     * // Update one User_bookings
     * const user_bookings = await prisma.user_bookings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends user_bookingsUpdateArgs>(args: SelectSubset<T, user_bookingsUpdateArgs<ExtArgs>>): Prisma__user_bookingsClient<$Result.GetResult<Prisma.$user_bookingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more User_bookings.
     * @param {user_bookingsDeleteManyArgs} args - Arguments to filter User_bookings to delete.
     * @example
     * // Delete a few User_bookings
     * const { count } = await prisma.user_bookings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends user_bookingsDeleteManyArgs>(args?: SelectSubset<T, user_bookingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more User_bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_bookingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many User_bookings
     * const user_bookings = await prisma.user_bookings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends user_bookingsUpdateManyArgs>(args: SelectSubset<T, user_bookingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more User_bookings and returns the data updated in the database.
     * @param {user_bookingsUpdateManyAndReturnArgs} args - Arguments to update many User_bookings.
     * @example
     * // Update many User_bookings
     * const user_bookings = await prisma.user_bookings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more User_bookings and only return the `id`
     * const user_bookingsWithIdOnly = await prisma.user_bookings.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends user_bookingsUpdateManyAndReturnArgs>(args: SelectSubset<T, user_bookingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_bookingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User_bookings.
     * @param {user_bookingsUpsertArgs} args - Arguments to update or create a User_bookings.
     * @example
     * // Update or create a User_bookings
     * const user_bookings = await prisma.user_bookings.upsert({
     *   create: {
     *     // ... data to create a User_bookings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User_bookings we want to update
     *   }
     * })
     */
    upsert<T extends user_bookingsUpsertArgs>(args: SelectSubset<T, user_bookingsUpsertArgs<ExtArgs>>): Prisma__user_bookingsClient<$Result.GetResult<Prisma.$user_bookingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of User_bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_bookingsCountArgs} args - Arguments to filter User_bookings to count.
     * @example
     * // Count the number of User_bookings
     * const count = await prisma.user_bookings.count({
     *   where: {
     *     // ... the filter for the User_bookings we want to count
     *   }
     * })
    **/
    count<T extends user_bookingsCountArgs>(
      args?: Subset<T, user_bookingsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], User_bookingsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User_bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {User_bookingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends User_bookingsAggregateArgs>(args: Subset<T, User_bookingsAggregateArgs>): Prisma.PrismaPromise<GetUser_bookingsAggregateType<T>>

    /**
     * Group by User_bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {user_bookingsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends user_bookingsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: user_bookingsGroupByArgs['orderBy'] }
        : { orderBy?: user_bookingsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, user_bookingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUser_bookingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the user_bookings model
   */
  readonly fields: user_bookingsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for user_bookings.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__user_bookingsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    slots<T extends slotsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, slotsDefaultArgs<ExtArgs>>): Prisma__slotsClient<$Result.GetResult<Prisma.$slotsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    users<T extends usersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, usersDefaultArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the user_bookings model
   */
  interface user_bookingsFieldRefs {
    readonly id: FieldRef<"user_bookings", 'String'>
    readonly userId: FieldRef<"user_bookings", 'String'>
    readonly slotId: FieldRef<"user_bookings", 'String'>
    readonly numberOfPeople: FieldRef<"user_bookings", 'Int'>
    readonly qrCode: FieldRef<"user_bookings", 'String'>
    readonly status: FieldRef<"user_bookings", 'String'>
    readonly checkedInAt: FieldRef<"user_bookings", 'DateTime'>
    readonly createdAt: FieldRef<"user_bookings", 'DateTime'>
    readonly updatedAt: FieldRef<"user_bookings", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * user_bookings findUnique
   */
  export type user_bookingsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_bookings
     */
    select?: user_bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_bookings
     */
    omit?: user_bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_bookingsInclude<ExtArgs> | null
    /**
     * Filter, which user_bookings to fetch.
     */
    where: user_bookingsWhereUniqueInput
  }

  /**
   * user_bookings findUniqueOrThrow
   */
  export type user_bookingsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_bookings
     */
    select?: user_bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_bookings
     */
    omit?: user_bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_bookingsInclude<ExtArgs> | null
    /**
     * Filter, which user_bookings to fetch.
     */
    where: user_bookingsWhereUniqueInput
  }

  /**
   * user_bookings findFirst
   */
  export type user_bookingsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_bookings
     */
    select?: user_bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_bookings
     */
    omit?: user_bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_bookingsInclude<ExtArgs> | null
    /**
     * Filter, which user_bookings to fetch.
     */
    where?: user_bookingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_bookings to fetch.
     */
    orderBy?: user_bookingsOrderByWithRelationInput | user_bookingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for user_bookings.
     */
    cursor?: user_bookingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of user_bookings.
     */
    distinct?: User_bookingsScalarFieldEnum | User_bookingsScalarFieldEnum[]
  }

  /**
   * user_bookings findFirstOrThrow
   */
  export type user_bookingsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_bookings
     */
    select?: user_bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_bookings
     */
    omit?: user_bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_bookingsInclude<ExtArgs> | null
    /**
     * Filter, which user_bookings to fetch.
     */
    where?: user_bookingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_bookings to fetch.
     */
    orderBy?: user_bookingsOrderByWithRelationInput | user_bookingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for user_bookings.
     */
    cursor?: user_bookingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of user_bookings.
     */
    distinct?: User_bookingsScalarFieldEnum | User_bookingsScalarFieldEnum[]
  }

  /**
   * user_bookings findMany
   */
  export type user_bookingsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_bookings
     */
    select?: user_bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_bookings
     */
    omit?: user_bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_bookingsInclude<ExtArgs> | null
    /**
     * Filter, which user_bookings to fetch.
     */
    where?: user_bookingsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of user_bookings to fetch.
     */
    orderBy?: user_bookingsOrderByWithRelationInput | user_bookingsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing user_bookings.
     */
    cursor?: user_bookingsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` user_bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` user_bookings.
     */
    skip?: number
    distinct?: User_bookingsScalarFieldEnum | User_bookingsScalarFieldEnum[]
  }

  /**
   * user_bookings create
   */
  export type user_bookingsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_bookings
     */
    select?: user_bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_bookings
     */
    omit?: user_bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_bookingsInclude<ExtArgs> | null
    /**
     * The data needed to create a user_bookings.
     */
    data: XOR<user_bookingsCreateInput, user_bookingsUncheckedCreateInput>
  }

  /**
   * user_bookings createMany
   */
  export type user_bookingsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many user_bookings.
     */
    data: user_bookingsCreateManyInput | user_bookingsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * user_bookings createManyAndReturn
   */
  export type user_bookingsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_bookings
     */
    select?: user_bookingsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the user_bookings
     */
    omit?: user_bookingsOmit<ExtArgs> | null
    /**
     * The data used to create many user_bookings.
     */
    data: user_bookingsCreateManyInput | user_bookingsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_bookingsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * user_bookings update
   */
  export type user_bookingsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_bookings
     */
    select?: user_bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_bookings
     */
    omit?: user_bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_bookingsInclude<ExtArgs> | null
    /**
     * The data needed to update a user_bookings.
     */
    data: XOR<user_bookingsUpdateInput, user_bookingsUncheckedUpdateInput>
    /**
     * Choose, which user_bookings to update.
     */
    where: user_bookingsWhereUniqueInput
  }

  /**
   * user_bookings updateMany
   */
  export type user_bookingsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update user_bookings.
     */
    data: XOR<user_bookingsUpdateManyMutationInput, user_bookingsUncheckedUpdateManyInput>
    /**
     * Filter which user_bookings to update
     */
    where?: user_bookingsWhereInput
    /**
     * Limit how many user_bookings to update.
     */
    limit?: number
  }

  /**
   * user_bookings updateManyAndReturn
   */
  export type user_bookingsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_bookings
     */
    select?: user_bookingsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the user_bookings
     */
    omit?: user_bookingsOmit<ExtArgs> | null
    /**
     * The data used to update user_bookings.
     */
    data: XOR<user_bookingsUpdateManyMutationInput, user_bookingsUncheckedUpdateManyInput>
    /**
     * Filter which user_bookings to update
     */
    where?: user_bookingsWhereInput
    /**
     * Limit how many user_bookings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_bookingsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * user_bookings upsert
   */
  export type user_bookingsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_bookings
     */
    select?: user_bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_bookings
     */
    omit?: user_bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_bookingsInclude<ExtArgs> | null
    /**
     * The filter to search for the user_bookings to update in case it exists.
     */
    where: user_bookingsWhereUniqueInput
    /**
     * In case the user_bookings found by the `where` argument doesn't exist, create a new user_bookings with this data.
     */
    create: XOR<user_bookingsCreateInput, user_bookingsUncheckedCreateInput>
    /**
     * In case the user_bookings was found with the provided `where` argument, update it with this data.
     */
    update: XOR<user_bookingsUpdateInput, user_bookingsUncheckedUpdateInput>
  }

  /**
   * user_bookings delete
   */
  export type user_bookingsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_bookings
     */
    select?: user_bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_bookings
     */
    omit?: user_bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_bookingsInclude<ExtArgs> | null
    /**
     * Filter which user_bookings to delete.
     */
    where: user_bookingsWhereUniqueInput
  }

  /**
   * user_bookings deleteMany
   */
  export type user_bookingsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which user_bookings to delete
     */
    where?: user_bookingsWhereInput
    /**
     * Limit how many user_bookings to delete.
     */
    limit?: number
  }

  /**
   * user_bookings without action
   */
  export type user_bookingsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_bookings
     */
    select?: user_bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_bookings
     */
    omit?: user_bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_bookingsInclude<ExtArgs> | null
  }


  /**
   * Model users
   */

  export type AggregateUsers = {
    _count: UsersCountAggregateOutputType | null
    _avg: UsersAvgAggregateOutputType | null
    _sum: UsersSumAggregateOutputType | null
    _min: UsersMinAggregateOutputType | null
    _max: UsersMaxAggregateOutputType | null
  }

  export type UsersAvgAggregateOutputType = {
    failedLoginCount: number | null
    latitude: number | null
    longitude: number | null
  }

  export type UsersSumAggregateOutputType = {
    failedLoginCount: number | null
    latitude: number | null
    longitude: number | null
  }

  export type UsersMinAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    name: string | null
    phone: string | null
    createdAt: Date | null
    updatedAt: Date | null
    lastLoginAt: Date | null
    failedLoginCount: number | null
    lockedUntil: Date | null
    address: string | null
    city: string | null
    country: string | null
    formattedAddress: string | null
    latitude: number | null
    longitude: number | null
    pinCode: string | null
    placeId: string | null
    state: string | null
    role: $Enums.UserRole | null
  }

  export type UsersMaxAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    name: string | null
    phone: string | null
    createdAt: Date | null
    updatedAt: Date | null
    lastLoginAt: Date | null
    failedLoginCount: number | null
    lockedUntil: Date | null
    address: string | null
    city: string | null
    country: string | null
    formattedAddress: string | null
    latitude: number | null
    longitude: number | null
    pinCode: string | null
    placeId: string | null
    state: string | null
    role: $Enums.UserRole | null
  }

  export type UsersCountAggregateOutputType = {
    id: number
    email: number
    passwordHash: number
    name: number
    phone: number
    createdAt: number
    updatedAt: number
    lastLoginAt: number
    failedLoginCount: number
    lockedUntil: number
    address: number
    city: number
    country: number
    formattedAddress: number
    latitude: number
    longitude: number
    pinCode: number
    placeId: number
    state: number
    role: number
    _all: number
  }


  export type UsersAvgAggregateInputType = {
    failedLoginCount?: true
    latitude?: true
    longitude?: true
  }

  export type UsersSumAggregateInputType = {
    failedLoginCount?: true
    latitude?: true
    longitude?: true
  }

  export type UsersMinAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    name?: true
    phone?: true
    createdAt?: true
    updatedAt?: true
    lastLoginAt?: true
    failedLoginCount?: true
    lockedUntil?: true
    address?: true
    city?: true
    country?: true
    formattedAddress?: true
    latitude?: true
    longitude?: true
    pinCode?: true
    placeId?: true
    state?: true
    role?: true
  }

  export type UsersMaxAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    name?: true
    phone?: true
    createdAt?: true
    updatedAt?: true
    lastLoginAt?: true
    failedLoginCount?: true
    lockedUntil?: true
    address?: true
    city?: true
    country?: true
    formattedAddress?: true
    latitude?: true
    longitude?: true
    pinCode?: true
    placeId?: true
    state?: true
    role?: true
  }

  export type UsersCountAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    name?: true
    phone?: true
    createdAt?: true
    updatedAt?: true
    lastLoginAt?: true
    failedLoginCount?: true
    lockedUntil?: true
    address?: true
    city?: true
    country?: true
    formattedAddress?: true
    latitude?: true
    longitude?: true
    pinCode?: true
    placeId?: true
    state?: true
    role?: true
    _all?: true
  }

  export type UsersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which users to aggregate.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned users
    **/
    _count?: true | UsersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UsersAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UsersSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsersMaxAggregateInputType
  }

  export type GetUsersAggregateType<T extends UsersAggregateArgs> = {
        [P in keyof T & keyof AggregateUsers]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsers[P]>
      : GetScalarType<T[P], AggregateUsers[P]>
  }




  export type usersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: usersWhereInput
    orderBy?: usersOrderByWithAggregationInput | usersOrderByWithAggregationInput[]
    by: UsersScalarFieldEnum[] | UsersScalarFieldEnum
    having?: usersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsersCountAggregateInputType | true
    _avg?: UsersAvgAggregateInputType
    _sum?: UsersSumAggregateInputType
    _min?: UsersMinAggregateInputType
    _max?: UsersMaxAggregateInputType
  }

  export type UsersGroupByOutputType = {
    id: string
    email: string
    passwordHash: string
    name: string | null
    phone: string | null
    createdAt: Date
    updatedAt: Date
    lastLoginAt: Date | null
    failedLoginCount: number
    lockedUntil: Date | null
    address: string | null
    city: string | null
    country: string | null
    formattedAddress: string | null
    latitude: number | null
    longitude: number | null
    pinCode: string | null
    placeId: string | null
    state: string | null
    role: $Enums.UserRole
    _count: UsersCountAggregateOutputType | null
    _avg: UsersAvgAggregateOutputType | null
    _sum: UsersSumAggregateOutputType | null
    _min: UsersMinAggregateOutputType | null
    _max: UsersMaxAggregateOutputType | null
  }

  type GetUsersGroupByPayload<T extends usersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsersGroupByOutputType[P]>
            : GetScalarType<T[P], UsersGroupByOutputType[P]>
        }
      >
    >


  export type usersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    name?: boolean
    phone?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
    failedLoginCount?: boolean
    lockedUntil?: boolean
    address?: boolean
    city?: boolean
    country?: boolean
    formattedAddress?: boolean
    latitude?: boolean
    longitude?: boolean
    pinCode?: boolean
    placeId?: boolean
    state?: boolean
    role?: boolean
    password_reset_tokens?: boolean | users$password_reset_tokensArgs<ExtArgs>
    sos_alerts?: boolean | users$sos_alertsArgs<ExtArgs>
    user_bookings?: boolean | users$user_bookingsArgs<ExtArgs>
    _count?: boolean | UsersCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["users"]>

  export type usersSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    name?: boolean
    phone?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
    failedLoginCount?: boolean
    lockedUntil?: boolean
    address?: boolean
    city?: boolean
    country?: boolean
    formattedAddress?: boolean
    latitude?: boolean
    longitude?: boolean
    pinCode?: boolean
    placeId?: boolean
    state?: boolean
    role?: boolean
  }, ExtArgs["result"]["users"]>

  export type usersSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    name?: boolean
    phone?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
    failedLoginCount?: boolean
    lockedUntil?: boolean
    address?: boolean
    city?: boolean
    country?: boolean
    formattedAddress?: boolean
    latitude?: boolean
    longitude?: boolean
    pinCode?: boolean
    placeId?: boolean
    state?: boolean
    role?: boolean
  }, ExtArgs["result"]["users"]>

  export type usersSelectScalar = {
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    name?: boolean
    phone?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
    failedLoginCount?: boolean
    lockedUntil?: boolean
    address?: boolean
    city?: boolean
    country?: boolean
    formattedAddress?: boolean
    latitude?: boolean
    longitude?: boolean
    pinCode?: boolean
    placeId?: boolean
    state?: boolean
    role?: boolean
  }

  export type usersOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "passwordHash" | "name" | "phone" | "createdAt" | "updatedAt" | "lastLoginAt" | "failedLoginCount" | "lockedUntil" | "address" | "city" | "country" | "formattedAddress" | "latitude" | "longitude" | "pinCode" | "placeId" | "state" | "role", ExtArgs["result"]["users"]>
  export type usersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    password_reset_tokens?: boolean | users$password_reset_tokensArgs<ExtArgs>
    sos_alerts?: boolean | users$sos_alertsArgs<ExtArgs>
    user_bookings?: boolean | users$user_bookingsArgs<ExtArgs>
    _count?: boolean | UsersCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type usersIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type usersIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $usersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "users"
    objects: {
      password_reset_tokens: Prisma.$password_reset_tokensPayload<ExtArgs>[]
      sos_alerts: Prisma.$sos_alertsPayload<ExtArgs>[]
      user_bookings: Prisma.$user_bookingsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      passwordHash: string
      name: string | null
      phone: string | null
      createdAt: Date
      updatedAt: Date
      lastLoginAt: Date | null
      failedLoginCount: number
      lockedUntil: Date | null
      address: string | null
      city: string | null
      country: string | null
      formattedAddress: string | null
      latitude: number | null
      longitude: number | null
      pinCode: string | null
      placeId: string | null
      state: string | null
      role: $Enums.UserRole
    }, ExtArgs["result"]["users"]>
    composites: {}
  }

  type usersGetPayload<S extends boolean | null | undefined | usersDefaultArgs> = $Result.GetResult<Prisma.$usersPayload, S>

  type usersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<usersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UsersCountAggregateInputType | true
    }

  export interface usersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['users'], meta: { name: 'users' } }
    /**
     * Find zero or one Users that matches the filter.
     * @param {usersFindUniqueArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends usersFindUniqueArgs>(args: SelectSubset<T, usersFindUniqueArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Users that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {usersFindUniqueOrThrowArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends usersFindUniqueOrThrowArgs>(args: SelectSubset<T, usersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindFirstArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends usersFindFirstArgs>(args?: SelectSubset<T, usersFindFirstArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Users that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindFirstOrThrowArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends usersFindFirstOrThrowArgs>(args?: SelectSubset<T, usersFindFirstOrThrowArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.users.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.users.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const usersWithIdOnly = await prisma.users.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends usersFindManyArgs>(args?: SelectSubset<T, usersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Users.
     * @param {usersCreateArgs} args - Arguments to create a Users.
     * @example
     * // Create one Users
     * const Users = await prisma.users.create({
     *   data: {
     *     // ... data to create a Users
     *   }
     * })
     * 
     */
    create<T extends usersCreateArgs>(args: SelectSubset<T, usersCreateArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {usersCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const users = await prisma.users.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends usersCreateManyArgs>(args?: SelectSubset<T, usersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {usersCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const users = await prisma.users.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const usersWithIdOnly = await prisma.users.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends usersCreateManyAndReturnArgs>(args?: SelectSubset<T, usersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Users.
     * @param {usersDeleteArgs} args - Arguments to delete one Users.
     * @example
     * // Delete one Users
     * const Users = await prisma.users.delete({
     *   where: {
     *     // ... filter to delete one Users
     *   }
     * })
     * 
     */
    delete<T extends usersDeleteArgs>(args: SelectSubset<T, usersDeleteArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Users.
     * @param {usersUpdateArgs} args - Arguments to update one Users.
     * @example
     * // Update one Users
     * const users = await prisma.users.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends usersUpdateArgs>(args: SelectSubset<T, usersUpdateArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {usersDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.users.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends usersDeleteManyArgs>(args?: SelectSubset<T, usersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const users = await prisma.users.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends usersUpdateManyArgs>(args: SelectSubset<T, usersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {usersUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const users = await prisma.users.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const usersWithIdOnly = await prisma.users.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends usersUpdateManyAndReturnArgs>(args: SelectSubset<T, usersUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Users.
     * @param {usersUpsertArgs} args - Arguments to update or create a Users.
     * @example
     * // Update or create a Users
     * const users = await prisma.users.upsert({
     *   create: {
     *     // ... data to create a Users
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Users we want to update
     *   }
     * })
     */
    upsert<T extends usersUpsertArgs>(args: SelectSubset<T, usersUpsertArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.users.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends usersCountArgs>(
      args?: Subset<T, usersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsersAggregateArgs>(args: Subset<T, UsersAggregateArgs>): Prisma.PrismaPromise<GetUsersAggregateType<T>>

    /**
     * Group by Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends usersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: usersGroupByArgs['orderBy'] }
        : { orderBy?: usersGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, usersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the users model
   */
  readonly fields: usersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for users.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__usersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    password_reset_tokens<T extends users$password_reset_tokensArgs<ExtArgs> = {}>(args?: Subset<T, users$password_reset_tokensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$password_reset_tokensPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    sos_alerts<T extends users$sos_alertsArgs<ExtArgs> = {}>(args?: Subset<T, users$sos_alertsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$sos_alertsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    user_bookings<T extends users$user_bookingsArgs<ExtArgs> = {}>(args?: Subset<T, users$user_bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$user_bookingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the users model
   */
  interface usersFieldRefs {
    readonly id: FieldRef<"users", 'String'>
    readonly email: FieldRef<"users", 'String'>
    readonly passwordHash: FieldRef<"users", 'String'>
    readonly name: FieldRef<"users", 'String'>
    readonly phone: FieldRef<"users", 'String'>
    readonly createdAt: FieldRef<"users", 'DateTime'>
    readonly updatedAt: FieldRef<"users", 'DateTime'>
    readonly lastLoginAt: FieldRef<"users", 'DateTime'>
    readonly failedLoginCount: FieldRef<"users", 'Int'>
    readonly lockedUntil: FieldRef<"users", 'DateTime'>
    readonly address: FieldRef<"users", 'String'>
    readonly city: FieldRef<"users", 'String'>
    readonly country: FieldRef<"users", 'String'>
    readonly formattedAddress: FieldRef<"users", 'String'>
    readonly latitude: FieldRef<"users", 'Float'>
    readonly longitude: FieldRef<"users", 'Float'>
    readonly pinCode: FieldRef<"users", 'String'>
    readonly placeId: FieldRef<"users", 'String'>
    readonly state: FieldRef<"users", 'String'>
    readonly role: FieldRef<"users", 'UserRole'>
  }
    

  // Custom InputTypes
  /**
   * users findUnique
   */
  export type usersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users findUniqueOrThrow
   */
  export type usersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users findFirst
   */
  export type usersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users findFirstOrThrow
   */
  export type usersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users findMany
   */
  export type usersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users create
   */
  export type usersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * The data needed to create a users.
     */
    data: XOR<usersCreateInput, usersUncheckedCreateInput>
  }

  /**
   * users createMany
   */
  export type usersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many users.
     */
    data: usersCreateManyInput | usersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * users createManyAndReturn
   */
  export type usersCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * The data used to create many users.
     */
    data: usersCreateManyInput | usersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * users update
   */
  export type usersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * The data needed to update a users.
     */
    data: XOR<usersUpdateInput, usersUncheckedUpdateInput>
    /**
     * Choose, which users to update.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users updateMany
   */
  export type usersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update users.
     */
    data: XOR<usersUpdateManyMutationInput, usersUncheckedUpdateManyInput>
    /**
     * Filter which users to update
     */
    where?: usersWhereInput
    /**
     * Limit how many users to update.
     */
    limit?: number
  }

  /**
   * users updateManyAndReturn
   */
  export type usersUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * The data used to update users.
     */
    data: XOR<usersUpdateManyMutationInput, usersUncheckedUpdateManyInput>
    /**
     * Filter which users to update
     */
    where?: usersWhereInput
    /**
     * Limit how many users to update.
     */
    limit?: number
  }

  /**
   * users upsert
   */
  export type usersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * The filter to search for the users to update in case it exists.
     */
    where: usersWhereUniqueInput
    /**
     * In case the users found by the `where` argument doesn't exist, create a new users with this data.
     */
    create: XOR<usersCreateInput, usersUncheckedCreateInput>
    /**
     * In case the users was found with the provided `where` argument, update it with this data.
     */
    update: XOR<usersUpdateInput, usersUncheckedUpdateInput>
  }

  /**
   * users delete
   */
  export type usersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter which users to delete.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users deleteMany
   */
  export type usersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which users to delete
     */
    where?: usersWhereInput
    /**
     * Limit how many users to delete.
     */
    limit?: number
  }

  /**
   * users.password_reset_tokens
   */
  export type users$password_reset_tokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the password_reset_tokens
     */
    select?: password_reset_tokensSelect<ExtArgs> | null
    /**
     * Omit specific fields from the password_reset_tokens
     */
    omit?: password_reset_tokensOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: password_reset_tokensInclude<ExtArgs> | null
    where?: password_reset_tokensWhereInput
    orderBy?: password_reset_tokensOrderByWithRelationInput | password_reset_tokensOrderByWithRelationInput[]
    cursor?: password_reset_tokensWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Password_reset_tokensScalarFieldEnum | Password_reset_tokensScalarFieldEnum[]
  }

  /**
   * users.sos_alerts
   */
  export type users$sos_alertsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sos_alerts
     */
    select?: sos_alertsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sos_alerts
     */
    omit?: sos_alertsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: sos_alertsInclude<ExtArgs> | null
    where?: sos_alertsWhereInput
    orderBy?: sos_alertsOrderByWithRelationInput | sos_alertsOrderByWithRelationInput[]
    cursor?: sos_alertsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Sos_alertsScalarFieldEnum | Sos_alertsScalarFieldEnum[]
  }

  /**
   * users.user_bookings
   */
  export type users$user_bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user_bookings
     */
    select?: user_bookingsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user_bookings
     */
    omit?: user_bookingsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: user_bookingsInclude<ExtArgs> | null
    where?: user_bookingsWhereInput
    orderBy?: user_bookingsOrderByWithRelationInput | user_bookingsOrderByWithRelationInput[]
    cursor?: user_bookingsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: User_bookingsScalarFieldEnum | User_bookingsScalarFieldEnum[]
  }

  /**
   * users without action
   */
  export type usersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const Admin_usersScalarFieldEnum: {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    role: 'role',
    createdAt: 'createdAt'
  };

  export type Admin_usersScalarFieldEnum = (typeof Admin_usersScalarFieldEnum)[keyof typeof Admin_usersScalarFieldEnum]


  export const BookingsScalarFieldEnum: {
    id: 'id',
    slotId: 'slotId',
    name: 'name',
    phone: 'phone',
    email: 'email',
    numberOfPeople: 'numberOfPeople',
    qrCode: 'qrCode',
    status: 'status',
    checkedInAt: 'checkedInAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BookingsScalarFieldEnum = (typeof BookingsScalarFieldEnum)[keyof typeof BookingsScalarFieldEnum]


  export const Crowd_snapshotsScalarFieldEnum: {
    id: 'id',
    zoneId: 'zoneId',
    zoneName: 'zoneName',
    footfall: 'footfall',
    capacity: 'capacity',
    timestamp: 'timestamp',
    dayOfWeek: 'dayOfWeek',
    hourOfDay: 'hourOfDay',
    createdAt: 'createdAt'
  };

  export type Crowd_snapshotsScalarFieldEnum = (typeof Crowd_snapshotsScalarFieldEnum)[keyof typeof Crowd_snapshotsScalarFieldEnum]


  export const Password_reset_tokensScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    token: 'token',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    usedAt: 'usedAt'
  };

  export type Password_reset_tokensScalarFieldEnum = (typeof Password_reset_tokensScalarFieldEnum)[keyof typeof Password_reset_tokensScalarFieldEnum]


  export const Peak_hour_patternsScalarFieldEnum: {
    id: 'id',
    zoneId: 'zoneId',
    dayOfWeek: 'dayOfWeek',
    startHour: 'startHour',
    endHour: 'endHour',
    avgFootfall: 'avgFootfall',
    confidence: 'confidence',
    updatedAt: 'updatedAt'
  };

  export type Peak_hour_patternsScalarFieldEnum = (typeof Peak_hour_patternsScalarFieldEnum)[keyof typeof Peak_hour_patternsScalarFieldEnum]


  export const Prediction_cacheScalarFieldEnum: {
    id: 'id',
    zoneId: 'zoneId',
    predictedTime: 'predictedTime',
    predictedValue: 'predictedValue',
    confidence: 'confidence',
    generatedAt: 'generatedAt',
    expiresAt: 'expiresAt'
  };

  export type Prediction_cacheScalarFieldEnum = (typeof Prediction_cacheScalarFieldEnum)[keyof typeof Prediction_cacheScalarFieldEnum]


  export const SlotsScalarFieldEnum: {
    id: 'id',
    date: 'date',
    startTime: 'startTime',
    endTime: 'endTime',
    capacity: 'capacity',
    bookedCount: 'bookedCount',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SlotsScalarFieldEnum = (typeof SlotsScalarFieldEnum)[keyof typeof SlotsScalarFieldEnum]


  export const Sos_alertsScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    userName: 'userName',
    userPhone: 'userPhone',
    userEmail: 'userEmail',
    latitude: 'latitude',
    longitude: 'longitude',
    manualLocation: 'manualLocation',
    message: 'message',
    emergencyType: 'emergencyType',
    status: 'status',
    resolvedAt: 'resolvedAt',
    resolvedBy: 'resolvedBy',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type Sos_alertsScalarFieldEnum = (typeof Sos_alertsScalarFieldEnum)[keyof typeof Sos_alertsScalarFieldEnum]


  export const User_bookingsScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    slotId: 'slotId',
    numberOfPeople: 'numberOfPeople',
    qrCode: 'qrCode',
    status: 'status',
    checkedInAt: 'checkedInAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type User_bookingsScalarFieldEnum = (typeof User_bookingsScalarFieldEnum)[keyof typeof User_bookingsScalarFieldEnum]


  export const UsersScalarFieldEnum: {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    name: 'name',
    phone: 'phone',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    lastLoginAt: 'lastLoginAt',
    failedLoginCount: 'failedLoginCount',
    lockedUntil: 'lockedUntil',
    address: 'address',
    city: 'city',
    country: 'country',
    formattedAddress: 'formattedAddress',
    latitude: 'latitude',
    longitude: 'longitude',
    pinCode: 'pinCode',
    placeId: 'placeId',
    state: 'state',
    role: 'role'
  };

  export type UsersScalarFieldEnum = (typeof UsersScalarFieldEnum)[keyof typeof UsersScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    
  /**
   * Deep Input Types
   */


  export type admin_usersWhereInput = {
    AND?: admin_usersWhereInput | admin_usersWhereInput[]
    OR?: admin_usersWhereInput[]
    NOT?: admin_usersWhereInput | admin_usersWhereInput[]
    id?: StringFilter<"admin_users"> | string
    email?: StringFilter<"admin_users"> | string
    passwordHash?: StringFilter<"admin_users"> | string
    role?: StringFilter<"admin_users"> | string
    createdAt?: DateTimeFilter<"admin_users"> | Date | string
  }

  export type admin_usersOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type admin_usersWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: admin_usersWhereInput | admin_usersWhereInput[]
    OR?: admin_usersWhereInput[]
    NOT?: admin_usersWhereInput | admin_usersWhereInput[]
    passwordHash?: StringFilter<"admin_users"> | string
    role?: StringFilter<"admin_users"> | string
    createdAt?: DateTimeFilter<"admin_users"> | Date | string
  }, "id" | "email">

  export type admin_usersOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    _count?: admin_usersCountOrderByAggregateInput
    _max?: admin_usersMaxOrderByAggregateInput
    _min?: admin_usersMinOrderByAggregateInput
  }

  export type admin_usersScalarWhereWithAggregatesInput = {
    AND?: admin_usersScalarWhereWithAggregatesInput | admin_usersScalarWhereWithAggregatesInput[]
    OR?: admin_usersScalarWhereWithAggregatesInput[]
    NOT?: admin_usersScalarWhereWithAggregatesInput | admin_usersScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"admin_users"> | string
    email?: StringWithAggregatesFilter<"admin_users"> | string
    passwordHash?: StringWithAggregatesFilter<"admin_users"> | string
    role?: StringWithAggregatesFilter<"admin_users"> | string
    createdAt?: DateTimeWithAggregatesFilter<"admin_users"> | Date | string
  }

  export type bookingsWhereInput = {
    AND?: bookingsWhereInput | bookingsWhereInput[]
    OR?: bookingsWhereInput[]
    NOT?: bookingsWhereInput | bookingsWhereInput[]
    id?: StringFilter<"bookings"> | string
    slotId?: StringFilter<"bookings"> | string
    name?: StringFilter<"bookings"> | string
    phone?: StringFilter<"bookings"> | string
    email?: StringFilter<"bookings"> | string
    numberOfPeople?: IntFilter<"bookings"> | number
    qrCode?: StringFilter<"bookings"> | string
    status?: StringFilter<"bookings"> | string
    checkedInAt?: DateTimeNullableFilter<"bookings"> | Date | string | null
    createdAt?: DateTimeFilter<"bookings"> | Date | string
    updatedAt?: DateTimeFilter<"bookings"> | Date | string
    slots?: XOR<SlotsScalarRelationFilter, slotsWhereInput>
  }

  export type bookingsOrderByWithRelationInput = {
    id?: SortOrder
    slotId?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    numberOfPeople?: SortOrder
    qrCode?: SortOrder
    status?: SortOrder
    checkedInAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    slots?: slotsOrderByWithRelationInput
  }

  export type bookingsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: bookingsWhereInput | bookingsWhereInput[]
    OR?: bookingsWhereInput[]
    NOT?: bookingsWhereInput | bookingsWhereInput[]
    slotId?: StringFilter<"bookings"> | string
    name?: StringFilter<"bookings"> | string
    phone?: StringFilter<"bookings"> | string
    email?: StringFilter<"bookings"> | string
    numberOfPeople?: IntFilter<"bookings"> | number
    qrCode?: StringFilter<"bookings"> | string
    status?: StringFilter<"bookings"> | string
    checkedInAt?: DateTimeNullableFilter<"bookings"> | Date | string | null
    createdAt?: DateTimeFilter<"bookings"> | Date | string
    updatedAt?: DateTimeFilter<"bookings"> | Date | string
    slots?: XOR<SlotsScalarRelationFilter, slotsWhereInput>
  }, "id">

  export type bookingsOrderByWithAggregationInput = {
    id?: SortOrder
    slotId?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    numberOfPeople?: SortOrder
    qrCode?: SortOrder
    status?: SortOrder
    checkedInAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: bookingsCountOrderByAggregateInput
    _avg?: bookingsAvgOrderByAggregateInput
    _max?: bookingsMaxOrderByAggregateInput
    _min?: bookingsMinOrderByAggregateInput
    _sum?: bookingsSumOrderByAggregateInput
  }

  export type bookingsScalarWhereWithAggregatesInput = {
    AND?: bookingsScalarWhereWithAggregatesInput | bookingsScalarWhereWithAggregatesInput[]
    OR?: bookingsScalarWhereWithAggregatesInput[]
    NOT?: bookingsScalarWhereWithAggregatesInput | bookingsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"bookings"> | string
    slotId?: StringWithAggregatesFilter<"bookings"> | string
    name?: StringWithAggregatesFilter<"bookings"> | string
    phone?: StringWithAggregatesFilter<"bookings"> | string
    email?: StringWithAggregatesFilter<"bookings"> | string
    numberOfPeople?: IntWithAggregatesFilter<"bookings"> | number
    qrCode?: StringWithAggregatesFilter<"bookings"> | string
    status?: StringWithAggregatesFilter<"bookings"> | string
    checkedInAt?: DateTimeNullableWithAggregatesFilter<"bookings"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"bookings"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"bookings"> | Date | string
  }

  export type crowd_snapshotsWhereInput = {
    AND?: crowd_snapshotsWhereInput | crowd_snapshotsWhereInput[]
    OR?: crowd_snapshotsWhereInput[]
    NOT?: crowd_snapshotsWhereInput | crowd_snapshotsWhereInput[]
    id?: StringFilter<"crowd_snapshots"> | string
    zoneId?: StringFilter<"crowd_snapshots"> | string
    zoneName?: StringFilter<"crowd_snapshots"> | string
    footfall?: IntFilter<"crowd_snapshots"> | number
    capacity?: IntFilter<"crowd_snapshots"> | number
    timestamp?: DateTimeFilter<"crowd_snapshots"> | Date | string
    dayOfWeek?: IntFilter<"crowd_snapshots"> | number
    hourOfDay?: IntFilter<"crowd_snapshots"> | number
    createdAt?: DateTimeFilter<"crowd_snapshots"> | Date | string
  }

  export type crowd_snapshotsOrderByWithRelationInput = {
    id?: SortOrder
    zoneId?: SortOrder
    zoneName?: SortOrder
    footfall?: SortOrder
    capacity?: SortOrder
    timestamp?: SortOrder
    dayOfWeek?: SortOrder
    hourOfDay?: SortOrder
    createdAt?: SortOrder
  }

  export type crowd_snapshotsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: crowd_snapshotsWhereInput | crowd_snapshotsWhereInput[]
    OR?: crowd_snapshotsWhereInput[]
    NOT?: crowd_snapshotsWhereInput | crowd_snapshotsWhereInput[]
    zoneId?: StringFilter<"crowd_snapshots"> | string
    zoneName?: StringFilter<"crowd_snapshots"> | string
    footfall?: IntFilter<"crowd_snapshots"> | number
    capacity?: IntFilter<"crowd_snapshots"> | number
    timestamp?: DateTimeFilter<"crowd_snapshots"> | Date | string
    dayOfWeek?: IntFilter<"crowd_snapshots"> | number
    hourOfDay?: IntFilter<"crowd_snapshots"> | number
    createdAt?: DateTimeFilter<"crowd_snapshots"> | Date | string
  }, "id">

  export type crowd_snapshotsOrderByWithAggregationInput = {
    id?: SortOrder
    zoneId?: SortOrder
    zoneName?: SortOrder
    footfall?: SortOrder
    capacity?: SortOrder
    timestamp?: SortOrder
    dayOfWeek?: SortOrder
    hourOfDay?: SortOrder
    createdAt?: SortOrder
    _count?: crowd_snapshotsCountOrderByAggregateInput
    _avg?: crowd_snapshotsAvgOrderByAggregateInput
    _max?: crowd_snapshotsMaxOrderByAggregateInput
    _min?: crowd_snapshotsMinOrderByAggregateInput
    _sum?: crowd_snapshotsSumOrderByAggregateInput
  }

  export type crowd_snapshotsScalarWhereWithAggregatesInput = {
    AND?: crowd_snapshotsScalarWhereWithAggregatesInput | crowd_snapshotsScalarWhereWithAggregatesInput[]
    OR?: crowd_snapshotsScalarWhereWithAggregatesInput[]
    NOT?: crowd_snapshotsScalarWhereWithAggregatesInput | crowd_snapshotsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"crowd_snapshots"> | string
    zoneId?: StringWithAggregatesFilter<"crowd_snapshots"> | string
    zoneName?: StringWithAggregatesFilter<"crowd_snapshots"> | string
    footfall?: IntWithAggregatesFilter<"crowd_snapshots"> | number
    capacity?: IntWithAggregatesFilter<"crowd_snapshots"> | number
    timestamp?: DateTimeWithAggregatesFilter<"crowd_snapshots"> | Date | string
    dayOfWeek?: IntWithAggregatesFilter<"crowd_snapshots"> | number
    hourOfDay?: IntWithAggregatesFilter<"crowd_snapshots"> | number
    createdAt?: DateTimeWithAggregatesFilter<"crowd_snapshots"> | Date | string
  }

  export type password_reset_tokensWhereInput = {
    AND?: password_reset_tokensWhereInput | password_reset_tokensWhereInput[]
    OR?: password_reset_tokensWhereInput[]
    NOT?: password_reset_tokensWhereInput | password_reset_tokensWhereInput[]
    id?: StringFilter<"password_reset_tokens"> | string
    userId?: StringFilter<"password_reset_tokens"> | string
    token?: StringFilter<"password_reset_tokens"> | string
    expiresAt?: DateTimeFilter<"password_reset_tokens"> | Date | string
    createdAt?: DateTimeFilter<"password_reset_tokens"> | Date | string
    usedAt?: DateTimeNullableFilter<"password_reset_tokens"> | Date | string | null
    users?: XOR<UsersScalarRelationFilter, usersWhereInput>
  }

  export type password_reset_tokensOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    usedAt?: SortOrderInput | SortOrder
    users?: usersOrderByWithRelationInput
  }

  export type password_reset_tokensWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: password_reset_tokensWhereInput | password_reset_tokensWhereInput[]
    OR?: password_reset_tokensWhereInput[]
    NOT?: password_reset_tokensWhereInput | password_reset_tokensWhereInput[]
    userId?: StringFilter<"password_reset_tokens"> | string
    expiresAt?: DateTimeFilter<"password_reset_tokens"> | Date | string
    createdAt?: DateTimeFilter<"password_reset_tokens"> | Date | string
    usedAt?: DateTimeNullableFilter<"password_reset_tokens"> | Date | string | null
    users?: XOR<UsersScalarRelationFilter, usersWhereInput>
  }, "id" | "token">

  export type password_reset_tokensOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    usedAt?: SortOrderInput | SortOrder
    _count?: password_reset_tokensCountOrderByAggregateInput
    _max?: password_reset_tokensMaxOrderByAggregateInput
    _min?: password_reset_tokensMinOrderByAggregateInput
  }

  export type password_reset_tokensScalarWhereWithAggregatesInput = {
    AND?: password_reset_tokensScalarWhereWithAggregatesInput | password_reset_tokensScalarWhereWithAggregatesInput[]
    OR?: password_reset_tokensScalarWhereWithAggregatesInput[]
    NOT?: password_reset_tokensScalarWhereWithAggregatesInput | password_reset_tokensScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"password_reset_tokens"> | string
    userId?: StringWithAggregatesFilter<"password_reset_tokens"> | string
    token?: StringWithAggregatesFilter<"password_reset_tokens"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"password_reset_tokens"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"password_reset_tokens"> | Date | string
    usedAt?: DateTimeNullableWithAggregatesFilter<"password_reset_tokens"> | Date | string | null
  }

  export type peak_hour_patternsWhereInput = {
    AND?: peak_hour_patternsWhereInput | peak_hour_patternsWhereInput[]
    OR?: peak_hour_patternsWhereInput[]
    NOT?: peak_hour_patternsWhereInput | peak_hour_patternsWhereInput[]
    id?: StringFilter<"peak_hour_patterns"> | string
    zoneId?: StringFilter<"peak_hour_patterns"> | string
    dayOfWeek?: IntFilter<"peak_hour_patterns"> | number
    startHour?: IntFilter<"peak_hour_patterns"> | number
    endHour?: IntFilter<"peak_hour_patterns"> | number
    avgFootfall?: FloatFilter<"peak_hour_patterns"> | number
    confidence?: FloatFilter<"peak_hour_patterns"> | number
    updatedAt?: DateTimeFilter<"peak_hour_patterns"> | Date | string
  }

  export type peak_hour_patternsOrderByWithRelationInput = {
    id?: SortOrder
    zoneId?: SortOrder
    dayOfWeek?: SortOrder
    startHour?: SortOrder
    endHour?: SortOrder
    avgFootfall?: SortOrder
    confidence?: SortOrder
    updatedAt?: SortOrder
  }

  export type peak_hour_patternsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    zoneId_dayOfWeek_startHour?: peak_hour_patternsZoneIdDayOfWeekStartHourCompoundUniqueInput
    AND?: peak_hour_patternsWhereInput | peak_hour_patternsWhereInput[]
    OR?: peak_hour_patternsWhereInput[]
    NOT?: peak_hour_patternsWhereInput | peak_hour_patternsWhereInput[]
    zoneId?: StringFilter<"peak_hour_patterns"> | string
    dayOfWeek?: IntFilter<"peak_hour_patterns"> | number
    startHour?: IntFilter<"peak_hour_patterns"> | number
    endHour?: IntFilter<"peak_hour_patterns"> | number
    avgFootfall?: FloatFilter<"peak_hour_patterns"> | number
    confidence?: FloatFilter<"peak_hour_patterns"> | number
    updatedAt?: DateTimeFilter<"peak_hour_patterns"> | Date | string
  }, "id" | "zoneId_dayOfWeek_startHour">

  export type peak_hour_patternsOrderByWithAggregationInput = {
    id?: SortOrder
    zoneId?: SortOrder
    dayOfWeek?: SortOrder
    startHour?: SortOrder
    endHour?: SortOrder
    avgFootfall?: SortOrder
    confidence?: SortOrder
    updatedAt?: SortOrder
    _count?: peak_hour_patternsCountOrderByAggregateInput
    _avg?: peak_hour_patternsAvgOrderByAggregateInput
    _max?: peak_hour_patternsMaxOrderByAggregateInput
    _min?: peak_hour_patternsMinOrderByAggregateInput
    _sum?: peak_hour_patternsSumOrderByAggregateInput
  }

  export type peak_hour_patternsScalarWhereWithAggregatesInput = {
    AND?: peak_hour_patternsScalarWhereWithAggregatesInput | peak_hour_patternsScalarWhereWithAggregatesInput[]
    OR?: peak_hour_patternsScalarWhereWithAggregatesInput[]
    NOT?: peak_hour_patternsScalarWhereWithAggregatesInput | peak_hour_patternsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"peak_hour_patterns"> | string
    zoneId?: StringWithAggregatesFilter<"peak_hour_patterns"> | string
    dayOfWeek?: IntWithAggregatesFilter<"peak_hour_patterns"> | number
    startHour?: IntWithAggregatesFilter<"peak_hour_patterns"> | number
    endHour?: IntWithAggregatesFilter<"peak_hour_patterns"> | number
    avgFootfall?: FloatWithAggregatesFilter<"peak_hour_patterns"> | number
    confidence?: FloatWithAggregatesFilter<"peak_hour_patterns"> | number
    updatedAt?: DateTimeWithAggregatesFilter<"peak_hour_patterns"> | Date | string
  }

  export type prediction_cacheWhereInput = {
    AND?: prediction_cacheWhereInput | prediction_cacheWhereInput[]
    OR?: prediction_cacheWhereInput[]
    NOT?: prediction_cacheWhereInput | prediction_cacheWhereInput[]
    id?: StringFilter<"prediction_cache"> | string
    zoneId?: StringFilter<"prediction_cache"> | string
    predictedTime?: DateTimeFilter<"prediction_cache"> | Date | string
    predictedValue?: IntFilter<"prediction_cache"> | number
    confidence?: FloatFilter<"prediction_cache"> | number
    generatedAt?: DateTimeFilter<"prediction_cache"> | Date | string
    expiresAt?: DateTimeFilter<"prediction_cache"> | Date | string
  }

  export type prediction_cacheOrderByWithRelationInput = {
    id?: SortOrder
    zoneId?: SortOrder
    predictedTime?: SortOrder
    predictedValue?: SortOrder
    confidence?: SortOrder
    generatedAt?: SortOrder
    expiresAt?: SortOrder
  }

  export type prediction_cacheWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: prediction_cacheWhereInput | prediction_cacheWhereInput[]
    OR?: prediction_cacheWhereInput[]
    NOT?: prediction_cacheWhereInput | prediction_cacheWhereInput[]
    zoneId?: StringFilter<"prediction_cache"> | string
    predictedTime?: DateTimeFilter<"prediction_cache"> | Date | string
    predictedValue?: IntFilter<"prediction_cache"> | number
    confidence?: FloatFilter<"prediction_cache"> | number
    generatedAt?: DateTimeFilter<"prediction_cache"> | Date | string
    expiresAt?: DateTimeFilter<"prediction_cache"> | Date | string
  }, "id">

  export type prediction_cacheOrderByWithAggregationInput = {
    id?: SortOrder
    zoneId?: SortOrder
    predictedTime?: SortOrder
    predictedValue?: SortOrder
    confidence?: SortOrder
    generatedAt?: SortOrder
    expiresAt?: SortOrder
    _count?: prediction_cacheCountOrderByAggregateInput
    _avg?: prediction_cacheAvgOrderByAggregateInput
    _max?: prediction_cacheMaxOrderByAggregateInput
    _min?: prediction_cacheMinOrderByAggregateInput
    _sum?: prediction_cacheSumOrderByAggregateInput
  }

  export type prediction_cacheScalarWhereWithAggregatesInput = {
    AND?: prediction_cacheScalarWhereWithAggregatesInput | prediction_cacheScalarWhereWithAggregatesInput[]
    OR?: prediction_cacheScalarWhereWithAggregatesInput[]
    NOT?: prediction_cacheScalarWhereWithAggregatesInput | prediction_cacheScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"prediction_cache"> | string
    zoneId?: StringWithAggregatesFilter<"prediction_cache"> | string
    predictedTime?: DateTimeWithAggregatesFilter<"prediction_cache"> | Date | string
    predictedValue?: IntWithAggregatesFilter<"prediction_cache"> | number
    confidence?: FloatWithAggregatesFilter<"prediction_cache"> | number
    generatedAt?: DateTimeWithAggregatesFilter<"prediction_cache"> | Date | string
    expiresAt?: DateTimeWithAggregatesFilter<"prediction_cache"> | Date | string
  }

  export type slotsWhereInput = {
    AND?: slotsWhereInput | slotsWhereInput[]
    OR?: slotsWhereInput[]
    NOT?: slotsWhereInput | slotsWhereInput[]
    id?: StringFilter<"slots"> | string
    date?: DateTimeFilter<"slots"> | Date | string
    startTime?: StringFilter<"slots"> | string
    endTime?: StringFilter<"slots"> | string
    capacity?: IntFilter<"slots"> | number
    bookedCount?: IntFilter<"slots"> | number
    isActive?: BoolFilter<"slots"> | boolean
    createdAt?: DateTimeFilter<"slots"> | Date | string
    updatedAt?: DateTimeFilter<"slots"> | Date | string
    bookings?: BookingsListRelationFilter
    user_bookings?: User_bookingsListRelationFilter
  }

  export type slotsOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    capacity?: SortOrder
    bookedCount?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    bookings?: bookingsOrderByRelationAggregateInput
    user_bookings?: user_bookingsOrderByRelationAggregateInput
  }

  export type slotsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: slotsWhereInput | slotsWhereInput[]
    OR?: slotsWhereInput[]
    NOT?: slotsWhereInput | slotsWhereInput[]
    date?: DateTimeFilter<"slots"> | Date | string
    startTime?: StringFilter<"slots"> | string
    endTime?: StringFilter<"slots"> | string
    capacity?: IntFilter<"slots"> | number
    bookedCount?: IntFilter<"slots"> | number
    isActive?: BoolFilter<"slots"> | boolean
    createdAt?: DateTimeFilter<"slots"> | Date | string
    updatedAt?: DateTimeFilter<"slots"> | Date | string
    bookings?: BookingsListRelationFilter
    user_bookings?: User_bookingsListRelationFilter
  }, "id">

  export type slotsOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    capacity?: SortOrder
    bookedCount?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: slotsCountOrderByAggregateInput
    _avg?: slotsAvgOrderByAggregateInput
    _max?: slotsMaxOrderByAggregateInput
    _min?: slotsMinOrderByAggregateInput
    _sum?: slotsSumOrderByAggregateInput
  }

  export type slotsScalarWhereWithAggregatesInput = {
    AND?: slotsScalarWhereWithAggregatesInput | slotsScalarWhereWithAggregatesInput[]
    OR?: slotsScalarWhereWithAggregatesInput[]
    NOT?: slotsScalarWhereWithAggregatesInput | slotsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"slots"> | string
    date?: DateTimeWithAggregatesFilter<"slots"> | Date | string
    startTime?: StringWithAggregatesFilter<"slots"> | string
    endTime?: StringWithAggregatesFilter<"slots"> | string
    capacity?: IntWithAggregatesFilter<"slots"> | number
    bookedCount?: IntWithAggregatesFilter<"slots"> | number
    isActive?: BoolWithAggregatesFilter<"slots"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"slots"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"slots"> | Date | string
  }

  export type sos_alertsWhereInput = {
    AND?: sos_alertsWhereInput | sos_alertsWhereInput[]
    OR?: sos_alertsWhereInput[]
    NOT?: sos_alertsWhereInput | sos_alertsWhereInput[]
    id?: StringFilter<"sos_alerts"> | string
    userId?: StringNullableFilter<"sos_alerts"> | string | null
    userName?: StringNullableFilter<"sos_alerts"> | string | null
    userPhone?: StringNullableFilter<"sos_alerts"> | string | null
    userEmail?: StringNullableFilter<"sos_alerts"> | string | null
    latitude?: FloatNullableFilter<"sos_alerts"> | number | null
    longitude?: FloatNullableFilter<"sos_alerts"> | number | null
    manualLocation?: StringNullableFilter<"sos_alerts"> | string | null
    message?: StringNullableFilter<"sos_alerts"> | string | null
    emergencyType?: StringFilter<"sos_alerts"> | string
    status?: StringFilter<"sos_alerts"> | string
    resolvedAt?: DateTimeNullableFilter<"sos_alerts"> | Date | string | null
    resolvedBy?: StringNullableFilter<"sos_alerts"> | string | null
    createdAt?: DateTimeFilter<"sos_alerts"> | Date | string
    updatedAt?: DateTimeFilter<"sos_alerts"> | Date | string
    users?: XOR<UsersNullableScalarRelationFilter, usersWhereInput> | null
  }

  export type sos_alertsOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    userName?: SortOrderInput | SortOrder
    userPhone?: SortOrderInput | SortOrder
    userEmail?: SortOrderInput | SortOrder
    latitude?: SortOrderInput | SortOrder
    longitude?: SortOrderInput | SortOrder
    manualLocation?: SortOrderInput | SortOrder
    message?: SortOrderInput | SortOrder
    emergencyType?: SortOrder
    status?: SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    resolvedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    users?: usersOrderByWithRelationInput
  }

  export type sos_alertsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: sos_alertsWhereInput | sos_alertsWhereInput[]
    OR?: sos_alertsWhereInput[]
    NOT?: sos_alertsWhereInput | sos_alertsWhereInput[]
    userId?: StringNullableFilter<"sos_alerts"> | string | null
    userName?: StringNullableFilter<"sos_alerts"> | string | null
    userPhone?: StringNullableFilter<"sos_alerts"> | string | null
    userEmail?: StringNullableFilter<"sos_alerts"> | string | null
    latitude?: FloatNullableFilter<"sos_alerts"> | number | null
    longitude?: FloatNullableFilter<"sos_alerts"> | number | null
    manualLocation?: StringNullableFilter<"sos_alerts"> | string | null
    message?: StringNullableFilter<"sos_alerts"> | string | null
    emergencyType?: StringFilter<"sos_alerts"> | string
    status?: StringFilter<"sos_alerts"> | string
    resolvedAt?: DateTimeNullableFilter<"sos_alerts"> | Date | string | null
    resolvedBy?: StringNullableFilter<"sos_alerts"> | string | null
    createdAt?: DateTimeFilter<"sos_alerts"> | Date | string
    updatedAt?: DateTimeFilter<"sos_alerts"> | Date | string
    users?: XOR<UsersNullableScalarRelationFilter, usersWhereInput> | null
  }, "id">

  export type sos_alertsOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    userName?: SortOrderInput | SortOrder
    userPhone?: SortOrderInput | SortOrder
    userEmail?: SortOrderInput | SortOrder
    latitude?: SortOrderInput | SortOrder
    longitude?: SortOrderInput | SortOrder
    manualLocation?: SortOrderInput | SortOrder
    message?: SortOrderInput | SortOrder
    emergencyType?: SortOrder
    status?: SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    resolvedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: sos_alertsCountOrderByAggregateInput
    _avg?: sos_alertsAvgOrderByAggregateInput
    _max?: sos_alertsMaxOrderByAggregateInput
    _min?: sos_alertsMinOrderByAggregateInput
    _sum?: sos_alertsSumOrderByAggregateInput
  }

  export type sos_alertsScalarWhereWithAggregatesInput = {
    AND?: sos_alertsScalarWhereWithAggregatesInput | sos_alertsScalarWhereWithAggregatesInput[]
    OR?: sos_alertsScalarWhereWithAggregatesInput[]
    NOT?: sos_alertsScalarWhereWithAggregatesInput | sos_alertsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"sos_alerts"> | string
    userId?: StringNullableWithAggregatesFilter<"sos_alerts"> | string | null
    userName?: StringNullableWithAggregatesFilter<"sos_alerts"> | string | null
    userPhone?: StringNullableWithAggregatesFilter<"sos_alerts"> | string | null
    userEmail?: StringNullableWithAggregatesFilter<"sos_alerts"> | string | null
    latitude?: FloatNullableWithAggregatesFilter<"sos_alerts"> | number | null
    longitude?: FloatNullableWithAggregatesFilter<"sos_alerts"> | number | null
    manualLocation?: StringNullableWithAggregatesFilter<"sos_alerts"> | string | null
    message?: StringNullableWithAggregatesFilter<"sos_alerts"> | string | null
    emergencyType?: StringWithAggregatesFilter<"sos_alerts"> | string
    status?: StringWithAggregatesFilter<"sos_alerts"> | string
    resolvedAt?: DateTimeNullableWithAggregatesFilter<"sos_alerts"> | Date | string | null
    resolvedBy?: StringNullableWithAggregatesFilter<"sos_alerts"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"sos_alerts"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"sos_alerts"> | Date | string
  }

  export type user_bookingsWhereInput = {
    AND?: user_bookingsWhereInput | user_bookingsWhereInput[]
    OR?: user_bookingsWhereInput[]
    NOT?: user_bookingsWhereInput | user_bookingsWhereInput[]
    id?: StringFilter<"user_bookings"> | string
    userId?: StringFilter<"user_bookings"> | string
    slotId?: StringFilter<"user_bookings"> | string
    numberOfPeople?: IntFilter<"user_bookings"> | number
    qrCode?: StringFilter<"user_bookings"> | string
    status?: StringFilter<"user_bookings"> | string
    checkedInAt?: DateTimeNullableFilter<"user_bookings"> | Date | string | null
    createdAt?: DateTimeFilter<"user_bookings"> | Date | string
    updatedAt?: DateTimeFilter<"user_bookings"> | Date | string
    slots?: XOR<SlotsScalarRelationFilter, slotsWhereInput>
    users?: XOR<UsersScalarRelationFilter, usersWhereInput>
  }

  export type user_bookingsOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    slotId?: SortOrder
    numberOfPeople?: SortOrder
    qrCode?: SortOrder
    status?: SortOrder
    checkedInAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    slots?: slotsOrderByWithRelationInput
    users?: usersOrderByWithRelationInput
  }

  export type user_bookingsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: user_bookingsWhereInput | user_bookingsWhereInput[]
    OR?: user_bookingsWhereInput[]
    NOT?: user_bookingsWhereInput | user_bookingsWhereInput[]
    userId?: StringFilter<"user_bookings"> | string
    slotId?: StringFilter<"user_bookings"> | string
    numberOfPeople?: IntFilter<"user_bookings"> | number
    qrCode?: StringFilter<"user_bookings"> | string
    status?: StringFilter<"user_bookings"> | string
    checkedInAt?: DateTimeNullableFilter<"user_bookings"> | Date | string | null
    createdAt?: DateTimeFilter<"user_bookings"> | Date | string
    updatedAt?: DateTimeFilter<"user_bookings"> | Date | string
    slots?: XOR<SlotsScalarRelationFilter, slotsWhereInput>
    users?: XOR<UsersScalarRelationFilter, usersWhereInput>
  }, "id">

  export type user_bookingsOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    slotId?: SortOrder
    numberOfPeople?: SortOrder
    qrCode?: SortOrder
    status?: SortOrder
    checkedInAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: user_bookingsCountOrderByAggregateInput
    _avg?: user_bookingsAvgOrderByAggregateInput
    _max?: user_bookingsMaxOrderByAggregateInput
    _min?: user_bookingsMinOrderByAggregateInput
    _sum?: user_bookingsSumOrderByAggregateInput
  }

  export type user_bookingsScalarWhereWithAggregatesInput = {
    AND?: user_bookingsScalarWhereWithAggregatesInput | user_bookingsScalarWhereWithAggregatesInput[]
    OR?: user_bookingsScalarWhereWithAggregatesInput[]
    NOT?: user_bookingsScalarWhereWithAggregatesInput | user_bookingsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"user_bookings"> | string
    userId?: StringWithAggregatesFilter<"user_bookings"> | string
    slotId?: StringWithAggregatesFilter<"user_bookings"> | string
    numberOfPeople?: IntWithAggregatesFilter<"user_bookings"> | number
    qrCode?: StringWithAggregatesFilter<"user_bookings"> | string
    status?: StringWithAggregatesFilter<"user_bookings"> | string
    checkedInAt?: DateTimeNullableWithAggregatesFilter<"user_bookings"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"user_bookings"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"user_bookings"> | Date | string
  }

  export type usersWhereInput = {
    AND?: usersWhereInput | usersWhereInput[]
    OR?: usersWhereInput[]
    NOT?: usersWhereInput | usersWhereInput[]
    id?: StringFilter<"users"> | string
    email?: StringFilter<"users"> | string
    passwordHash?: StringFilter<"users"> | string
    name?: StringNullableFilter<"users"> | string | null
    phone?: StringNullableFilter<"users"> | string | null
    createdAt?: DateTimeFilter<"users"> | Date | string
    updatedAt?: DateTimeFilter<"users"> | Date | string
    lastLoginAt?: DateTimeNullableFilter<"users"> | Date | string | null
    failedLoginCount?: IntFilter<"users"> | number
    lockedUntil?: DateTimeNullableFilter<"users"> | Date | string | null
    address?: StringNullableFilter<"users"> | string | null
    city?: StringNullableFilter<"users"> | string | null
    country?: StringNullableFilter<"users"> | string | null
    formattedAddress?: StringNullableFilter<"users"> | string | null
    latitude?: FloatNullableFilter<"users"> | number | null
    longitude?: FloatNullableFilter<"users"> | number | null
    pinCode?: StringNullableFilter<"users"> | string | null
    placeId?: StringNullableFilter<"users"> | string | null
    state?: StringNullableFilter<"users"> | string | null
    role?: EnumUserRoleFilter<"users"> | $Enums.UserRole
    password_reset_tokens?: Password_reset_tokensListRelationFilter
    sos_alerts?: Sos_alertsListRelationFilter
    user_bookings?: User_bookingsListRelationFilter
  }

  export type usersOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    failedLoginCount?: SortOrder
    lockedUntil?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    formattedAddress?: SortOrderInput | SortOrder
    latitude?: SortOrderInput | SortOrder
    longitude?: SortOrderInput | SortOrder
    pinCode?: SortOrderInput | SortOrder
    placeId?: SortOrderInput | SortOrder
    state?: SortOrderInput | SortOrder
    role?: SortOrder
    password_reset_tokens?: password_reset_tokensOrderByRelationAggregateInput
    sos_alerts?: sos_alertsOrderByRelationAggregateInput
    user_bookings?: user_bookingsOrderByRelationAggregateInput
  }

  export type usersWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: usersWhereInput | usersWhereInput[]
    OR?: usersWhereInput[]
    NOT?: usersWhereInput | usersWhereInput[]
    passwordHash?: StringFilter<"users"> | string
    name?: StringNullableFilter<"users"> | string | null
    phone?: StringNullableFilter<"users"> | string | null
    createdAt?: DateTimeFilter<"users"> | Date | string
    updatedAt?: DateTimeFilter<"users"> | Date | string
    lastLoginAt?: DateTimeNullableFilter<"users"> | Date | string | null
    failedLoginCount?: IntFilter<"users"> | number
    lockedUntil?: DateTimeNullableFilter<"users"> | Date | string | null
    address?: StringNullableFilter<"users"> | string | null
    city?: StringNullableFilter<"users"> | string | null
    country?: StringNullableFilter<"users"> | string | null
    formattedAddress?: StringNullableFilter<"users"> | string | null
    latitude?: FloatNullableFilter<"users"> | number | null
    longitude?: FloatNullableFilter<"users"> | number | null
    pinCode?: StringNullableFilter<"users"> | string | null
    placeId?: StringNullableFilter<"users"> | string | null
    state?: StringNullableFilter<"users"> | string | null
    role?: EnumUserRoleFilter<"users"> | $Enums.UserRole
    password_reset_tokens?: Password_reset_tokensListRelationFilter
    sos_alerts?: Sos_alertsListRelationFilter
    user_bookings?: User_bookingsListRelationFilter
  }, "id" | "email">

  export type usersOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    failedLoginCount?: SortOrder
    lockedUntil?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    formattedAddress?: SortOrderInput | SortOrder
    latitude?: SortOrderInput | SortOrder
    longitude?: SortOrderInput | SortOrder
    pinCode?: SortOrderInput | SortOrder
    placeId?: SortOrderInput | SortOrder
    state?: SortOrderInput | SortOrder
    role?: SortOrder
    _count?: usersCountOrderByAggregateInput
    _avg?: usersAvgOrderByAggregateInput
    _max?: usersMaxOrderByAggregateInput
    _min?: usersMinOrderByAggregateInput
    _sum?: usersSumOrderByAggregateInput
  }

  export type usersScalarWhereWithAggregatesInput = {
    AND?: usersScalarWhereWithAggregatesInput | usersScalarWhereWithAggregatesInput[]
    OR?: usersScalarWhereWithAggregatesInput[]
    NOT?: usersScalarWhereWithAggregatesInput | usersScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"users"> | string
    email?: StringWithAggregatesFilter<"users"> | string
    passwordHash?: StringWithAggregatesFilter<"users"> | string
    name?: StringNullableWithAggregatesFilter<"users"> | string | null
    phone?: StringNullableWithAggregatesFilter<"users"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"users"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"users"> | Date | string
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<"users"> | Date | string | null
    failedLoginCount?: IntWithAggregatesFilter<"users"> | number
    lockedUntil?: DateTimeNullableWithAggregatesFilter<"users"> | Date | string | null
    address?: StringNullableWithAggregatesFilter<"users"> | string | null
    city?: StringNullableWithAggregatesFilter<"users"> | string | null
    country?: StringNullableWithAggregatesFilter<"users"> | string | null
    formattedAddress?: StringNullableWithAggregatesFilter<"users"> | string | null
    latitude?: FloatNullableWithAggregatesFilter<"users"> | number | null
    longitude?: FloatNullableWithAggregatesFilter<"users"> | number | null
    pinCode?: StringNullableWithAggregatesFilter<"users"> | string | null
    placeId?: StringNullableWithAggregatesFilter<"users"> | string | null
    state?: StringNullableWithAggregatesFilter<"users"> | string | null
    role?: EnumUserRoleWithAggregatesFilter<"users"> | $Enums.UserRole
  }

  export type admin_usersCreateInput = {
    id: string
    email: string
    passwordHash: string
    role?: string
    createdAt?: Date | string
  }

  export type admin_usersUncheckedCreateInput = {
    id: string
    email: string
    passwordHash: string
    role?: string
    createdAt?: Date | string
  }

  export type admin_usersUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type admin_usersUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type admin_usersCreateManyInput = {
    id: string
    email: string
    passwordHash: string
    role?: string
    createdAt?: Date | string
  }

  export type admin_usersUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type admin_usersUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type bookingsCreateInput = {
    id: string
    name: string
    phone: string
    email: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
    slots: slotsCreateNestedOneWithoutBookingsInput
  }

  export type bookingsUncheckedCreateInput = {
    id: string
    slotId: string
    name: string
    phone: string
    email: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type bookingsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    slots?: slotsUpdateOneRequiredWithoutBookingsNestedInput
  }

  export type bookingsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slotId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type bookingsCreateManyInput = {
    id: string
    slotId: string
    name: string
    phone: string
    email: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type bookingsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type bookingsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    slotId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type crowd_snapshotsCreateInput = {
    id: string
    zoneId: string
    zoneName: string
    footfall: number
    capacity: number
    timestamp: Date | string
    dayOfWeek: number
    hourOfDay: number
    createdAt?: Date | string
  }

  export type crowd_snapshotsUncheckedCreateInput = {
    id: string
    zoneId: string
    zoneName: string
    footfall: number
    capacity: number
    timestamp: Date | string
    dayOfWeek: number
    hourOfDay: number
    createdAt?: Date | string
  }

  export type crowd_snapshotsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    zoneId?: StringFieldUpdateOperationsInput | string
    zoneName?: StringFieldUpdateOperationsInput | string
    footfall?: IntFieldUpdateOperationsInput | number
    capacity?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    dayOfWeek?: IntFieldUpdateOperationsInput | number
    hourOfDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type crowd_snapshotsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    zoneId?: StringFieldUpdateOperationsInput | string
    zoneName?: StringFieldUpdateOperationsInput | string
    footfall?: IntFieldUpdateOperationsInput | number
    capacity?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    dayOfWeek?: IntFieldUpdateOperationsInput | number
    hourOfDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type crowd_snapshotsCreateManyInput = {
    id: string
    zoneId: string
    zoneName: string
    footfall: number
    capacity: number
    timestamp: Date | string
    dayOfWeek: number
    hourOfDay: number
    createdAt?: Date | string
  }

  export type crowd_snapshotsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    zoneId?: StringFieldUpdateOperationsInput | string
    zoneName?: StringFieldUpdateOperationsInput | string
    footfall?: IntFieldUpdateOperationsInput | number
    capacity?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    dayOfWeek?: IntFieldUpdateOperationsInput | number
    hourOfDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type crowd_snapshotsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    zoneId?: StringFieldUpdateOperationsInput | string
    zoneName?: StringFieldUpdateOperationsInput | string
    footfall?: IntFieldUpdateOperationsInput | number
    capacity?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    dayOfWeek?: IntFieldUpdateOperationsInput | number
    hourOfDay?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type password_reset_tokensCreateInput = {
    id: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
    usedAt?: Date | string | null
    users: usersCreateNestedOneWithoutPassword_reset_tokensInput
  }

  export type password_reset_tokensUncheckedCreateInput = {
    id: string
    userId: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
    usedAt?: Date | string | null
  }

  export type password_reset_tokensUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    users?: usersUpdateOneRequiredWithoutPassword_reset_tokensNestedInput
  }

  export type password_reset_tokensUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type password_reset_tokensCreateManyInput = {
    id: string
    userId: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
    usedAt?: Date | string | null
  }

  export type password_reset_tokensUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type password_reset_tokensUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type peak_hour_patternsCreateInput = {
    id: string
    zoneId: string
    dayOfWeek: number
    startHour: number
    endHour: number
    avgFootfall: number
    confidence: number
    updatedAt: Date | string
  }

  export type peak_hour_patternsUncheckedCreateInput = {
    id: string
    zoneId: string
    dayOfWeek: number
    startHour: number
    endHour: number
    avgFootfall: number
    confidence: number
    updatedAt: Date | string
  }

  export type peak_hour_patternsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    zoneId?: StringFieldUpdateOperationsInput | string
    dayOfWeek?: IntFieldUpdateOperationsInput | number
    startHour?: IntFieldUpdateOperationsInput | number
    endHour?: IntFieldUpdateOperationsInput | number
    avgFootfall?: FloatFieldUpdateOperationsInput | number
    confidence?: FloatFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type peak_hour_patternsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    zoneId?: StringFieldUpdateOperationsInput | string
    dayOfWeek?: IntFieldUpdateOperationsInput | number
    startHour?: IntFieldUpdateOperationsInput | number
    endHour?: IntFieldUpdateOperationsInput | number
    avgFootfall?: FloatFieldUpdateOperationsInput | number
    confidence?: FloatFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type peak_hour_patternsCreateManyInput = {
    id: string
    zoneId: string
    dayOfWeek: number
    startHour: number
    endHour: number
    avgFootfall: number
    confidence: number
    updatedAt: Date | string
  }

  export type peak_hour_patternsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    zoneId?: StringFieldUpdateOperationsInput | string
    dayOfWeek?: IntFieldUpdateOperationsInput | number
    startHour?: IntFieldUpdateOperationsInput | number
    endHour?: IntFieldUpdateOperationsInput | number
    avgFootfall?: FloatFieldUpdateOperationsInput | number
    confidence?: FloatFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type peak_hour_patternsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    zoneId?: StringFieldUpdateOperationsInput | string
    dayOfWeek?: IntFieldUpdateOperationsInput | number
    startHour?: IntFieldUpdateOperationsInput | number
    endHour?: IntFieldUpdateOperationsInput | number
    avgFootfall?: FloatFieldUpdateOperationsInput | number
    confidence?: FloatFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type prediction_cacheCreateInput = {
    id: string
    zoneId: string
    predictedTime: Date | string
    predictedValue: number
    confidence: number
    generatedAt?: Date | string
    expiresAt: Date | string
  }

  export type prediction_cacheUncheckedCreateInput = {
    id: string
    zoneId: string
    predictedTime: Date | string
    predictedValue: number
    confidence: number
    generatedAt?: Date | string
    expiresAt: Date | string
  }

  export type prediction_cacheUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    zoneId?: StringFieldUpdateOperationsInput | string
    predictedTime?: DateTimeFieldUpdateOperationsInput | Date | string
    predictedValue?: IntFieldUpdateOperationsInput | number
    confidence?: FloatFieldUpdateOperationsInput | number
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type prediction_cacheUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    zoneId?: StringFieldUpdateOperationsInput | string
    predictedTime?: DateTimeFieldUpdateOperationsInput | Date | string
    predictedValue?: IntFieldUpdateOperationsInput | number
    confidence?: FloatFieldUpdateOperationsInput | number
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type prediction_cacheCreateManyInput = {
    id: string
    zoneId: string
    predictedTime: Date | string
    predictedValue: number
    confidence: number
    generatedAt?: Date | string
    expiresAt: Date | string
  }

  export type prediction_cacheUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    zoneId?: StringFieldUpdateOperationsInput | string
    predictedTime?: DateTimeFieldUpdateOperationsInput | Date | string
    predictedValue?: IntFieldUpdateOperationsInput | number
    confidence?: FloatFieldUpdateOperationsInput | number
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type prediction_cacheUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    zoneId?: StringFieldUpdateOperationsInput | string
    predictedTime?: DateTimeFieldUpdateOperationsInput | Date | string
    predictedValue?: IntFieldUpdateOperationsInput | number
    confidence?: FloatFieldUpdateOperationsInput | number
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type slotsCreateInput = {
    id: string
    date: Date | string
    startTime: string
    endTime: string
    capacity: number
    bookedCount?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt: Date | string
    bookings?: bookingsCreateNestedManyWithoutSlotsInput
    user_bookings?: user_bookingsCreateNestedManyWithoutSlotsInput
  }

  export type slotsUncheckedCreateInput = {
    id: string
    date: Date | string
    startTime: string
    endTime: string
    capacity: number
    bookedCount?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt: Date | string
    bookings?: bookingsUncheckedCreateNestedManyWithoutSlotsInput
    user_bookings?: user_bookingsUncheckedCreateNestedManyWithoutSlotsInput
  }

  export type slotsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    bookedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: bookingsUpdateManyWithoutSlotsNestedInput
    user_bookings?: user_bookingsUpdateManyWithoutSlotsNestedInput
  }

  export type slotsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    bookedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: bookingsUncheckedUpdateManyWithoutSlotsNestedInput
    user_bookings?: user_bookingsUncheckedUpdateManyWithoutSlotsNestedInput
  }

  export type slotsCreateManyInput = {
    id: string
    date: Date | string
    startTime: string
    endTime: string
    capacity: number
    bookedCount?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type slotsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    bookedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type slotsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    bookedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type sos_alertsCreateInput = {
    id: string
    userName?: string | null
    userPhone?: string | null
    userEmail?: string | null
    latitude?: number | null
    longitude?: number | null
    manualLocation?: string | null
    message?: string | null
    emergencyType: string
    status?: string
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    users?: usersCreateNestedOneWithoutSos_alertsInput
  }

  export type sos_alertsUncheckedCreateInput = {
    id: string
    userId?: string | null
    userName?: string | null
    userPhone?: string | null
    userEmail?: string | null
    latitude?: number | null
    longitude?: number | null
    manualLocation?: string | null
    message?: string | null
    emergencyType: string
    status?: string
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type sos_alertsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userPhone?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    manualLocation?: NullableStringFieldUpdateOperationsInput | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: usersUpdateOneWithoutSos_alertsNestedInput
  }

  export type sos_alertsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userPhone?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    manualLocation?: NullableStringFieldUpdateOperationsInput | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type sos_alertsCreateManyInput = {
    id: string
    userId?: string | null
    userName?: string | null
    userPhone?: string | null
    userEmail?: string | null
    latitude?: number | null
    longitude?: number | null
    manualLocation?: string | null
    message?: string | null
    emergencyType: string
    status?: string
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type sos_alertsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userPhone?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    manualLocation?: NullableStringFieldUpdateOperationsInput | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type sos_alertsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userPhone?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    manualLocation?: NullableStringFieldUpdateOperationsInput | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type user_bookingsCreateInput = {
    id: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
    slots: slotsCreateNestedOneWithoutUser_bookingsInput
    users: usersCreateNestedOneWithoutUser_bookingsInput
  }

  export type user_bookingsUncheckedCreateInput = {
    id: string
    userId: string
    slotId: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type user_bookingsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    slots?: slotsUpdateOneRequiredWithoutUser_bookingsNestedInput
    users?: usersUpdateOneRequiredWithoutUser_bookingsNestedInput
  }

  export type user_bookingsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    slotId?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type user_bookingsCreateManyInput = {
    id: string
    userId: string
    slotId: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type user_bookingsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type user_bookingsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    slotId?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type usersCreateInput = {
    id: string
    email: string
    passwordHash: string
    name?: string | null
    phone?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    lastLoginAt?: Date | string | null
    failedLoginCount?: number
    lockedUntil?: Date | string | null
    address?: string | null
    city?: string | null
    country?: string | null
    formattedAddress?: string | null
    latitude?: number | null
    longitude?: number | null
    pinCode?: string | null
    placeId?: string | null
    state?: string | null
    role?: $Enums.UserRole
    password_reset_tokens?: password_reset_tokensCreateNestedManyWithoutUsersInput
    sos_alerts?: sos_alertsCreateNestedManyWithoutUsersInput
    user_bookings?: user_bookingsCreateNestedManyWithoutUsersInput
  }

  export type usersUncheckedCreateInput = {
    id: string
    email: string
    passwordHash: string
    name?: string | null
    phone?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    lastLoginAt?: Date | string | null
    failedLoginCount?: number
    lockedUntil?: Date | string | null
    address?: string | null
    city?: string | null
    country?: string | null
    formattedAddress?: string | null
    latitude?: number | null
    longitude?: number | null
    pinCode?: string | null
    placeId?: string | null
    state?: string | null
    role?: $Enums.UserRole
    password_reset_tokens?: password_reset_tokensUncheckedCreateNestedManyWithoutUsersInput
    sos_alerts?: sos_alertsUncheckedCreateNestedManyWithoutUsersInput
    user_bookings?: user_bookingsUncheckedCreateNestedManyWithoutUsersInput
  }

  export type usersUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginCount?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    formattedAddress?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    pinCode?: NullableStringFieldUpdateOperationsInput | string | null
    placeId?: NullableStringFieldUpdateOperationsInput | string | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    password_reset_tokens?: password_reset_tokensUpdateManyWithoutUsersNestedInput
    sos_alerts?: sos_alertsUpdateManyWithoutUsersNestedInput
    user_bookings?: user_bookingsUpdateManyWithoutUsersNestedInput
  }

  export type usersUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginCount?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    formattedAddress?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    pinCode?: NullableStringFieldUpdateOperationsInput | string | null
    placeId?: NullableStringFieldUpdateOperationsInput | string | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    password_reset_tokens?: password_reset_tokensUncheckedUpdateManyWithoutUsersNestedInput
    sos_alerts?: sos_alertsUncheckedUpdateManyWithoutUsersNestedInput
    user_bookings?: user_bookingsUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type usersCreateManyInput = {
    id: string
    email: string
    passwordHash: string
    name?: string | null
    phone?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    lastLoginAt?: Date | string | null
    failedLoginCount?: number
    lockedUntil?: Date | string | null
    address?: string | null
    city?: string | null
    country?: string | null
    formattedAddress?: string | null
    latitude?: number | null
    longitude?: number | null
    pinCode?: string | null
    placeId?: string | null
    state?: string | null
    role?: $Enums.UserRole
  }

  export type usersUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginCount?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    formattedAddress?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    pinCode?: NullableStringFieldUpdateOperationsInput | string | null
    placeId?: NullableStringFieldUpdateOperationsInput | string | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
  }

  export type usersUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginCount?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    formattedAddress?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    pinCode?: NullableStringFieldUpdateOperationsInput | string | null
    placeId?: NullableStringFieldUpdateOperationsInput | string | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type admin_usersCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type admin_usersMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type admin_usersMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type SlotsScalarRelationFilter = {
    is?: slotsWhereInput
    isNot?: slotsWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type bookingsCountOrderByAggregateInput = {
    id?: SortOrder
    slotId?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    numberOfPeople?: SortOrder
    qrCode?: SortOrder
    status?: SortOrder
    checkedInAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type bookingsAvgOrderByAggregateInput = {
    numberOfPeople?: SortOrder
  }

  export type bookingsMaxOrderByAggregateInput = {
    id?: SortOrder
    slotId?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    numberOfPeople?: SortOrder
    qrCode?: SortOrder
    status?: SortOrder
    checkedInAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type bookingsMinOrderByAggregateInput = {
    id?: SortOrder
    slotId?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    numberOfPeople?: SortOrder
    qrCode?: SortOrder
    status?: SortOrder
    checkedInAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type bookingsSumOrderByAggregateInput = {
    numberOfPeople?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type crowd_snapshotsCountOrderByAggregateInput = {
    id?: SortOrder
    zoneId?: SortOrder
    zoneName?: SortOrder
    footfall?: SortOrder
    capacity?: SortOrder
    timestamp?: SortOrder
    dayOfWeek?: SortOrder
    hourOfDay?: SortOrder
    createdAt?: SortOrder
  }

  export type crowd_snapshotsAvgOrderByAggregateInput = {
    footfall?: SortOrder
    capacity?: SortOrder
    dayOfWeek?: SortOrder
    hourOfDay?: SortOrder
  }

  export type crowd_snapshotsMaxOrderByAggregateInput = {
    id?: SortOrder
    zoneId?: SortOrder
    zoneName?: SortOrder
    footfall?: SortOrder
    capacity?: SortOrder
    timestamp?: SortOrder
    dayOfWeek?: SortOrder
    hourOfDay?: SortOrder
    createdAt?: SortOrder
  }

  export type crowd_snapshotsMinOrderByAggregateInput = {
    id?: SortOrder
    zoneId?: SortOrder
    zoneName?: SortOrder
    footfall?: SortOrder
    capacity?: SortOrder
    timestamp?: SortOrder
    dayOfWeek?: SortOrder
    hourOfDay?: SortOrder
    createdAt?: SortOrder
  }

  export type crowd_snapshotsSumOrderByAggregateInput = {
    footfall?: SortOrder
    capacity?: SortOrder
    dayOfWeek?: SortOrder
    hourOfDay?: SortOrder
  }

  export type UsersScalarRelationFilter = {
    is?: usersWhereInput
    isNot?: usersWhereInput
  }

  export type password_reset_tokensCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    usedAt?: SortOrder
  }

  export type password_reset_tokensMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    usedAt?: SortOrder
  }

  export type password_reset_tokensMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    token?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    usedAt?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type peak_hour_patternsZoneIdDayOfWeekStartHourCompoundUniqueInput = {
    zoneId: string
    dayOfWeek: number
    startHour: number
  }

  export type peak_hour_patternsCountOrderByAggregateInput = {
    id?: SortOrder
    zoneId?: SortOrder
    dayOfWeek?: SortOrder
    startHour?: SortOrder
    endHour?: SortOrder
    avgFootfall?: SortOrder
    confidence?: SortOrder
    updatedAt?: SortOrder
  }

  export type peak_hour_patternsAvgOrderByAggregateInput = {
    dayOfWeek?: SortOrder
    startHour?: SortOrder
    endHour?: SortOrder
    avgFootfall?: SortOrder
    confidence?: SortOrder
  }

  export type peak_hour_patternsMaxOrderByAggregateInput = {
    id?: SortOrder
    zoneId?: SortOrder
    dayOfWeek?: SortOrder
    startHour?: SortOrder
    endHour?: SortOrder
    avgFootfall?: SortOrder
    confidence?: SortOrder
    updatedAt?: SortOrder
  }

  export type peak_hour_patternsMinOrderByAggregateInput = {
    id?: SortOrder
    zoneId?: SortOrder
    dayOfWeek?: SortOrder
    startHour?: SortOrder
    endHour?: SortOrder
    avgFootfall?: SortOrder
    confidence?: SortOrder
    updatedAt?: SortOrder
  }

  export type peak_hour_patternsSumOrderByAggregateInput = {
    dayOfWeek?: SortOrder
    startHour?: SortOrder
    endHour?: SortOrder
    avgFootfall?: SortOrder
    confidence?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type prediction_cacheCountOrderByAggregateInput = {
    id?: SortOrder
    zoneId?: SortOrder
    predictedTime?: SortOrder
    predictedValue?: SortOrder
    confidence?: SortOrder
    generatedAt?: SortOrder
    expiresAt?: SortOrder
  }

  export type prediction_cacheAvgOrderByAggregateInput = {
    predictedValue?: SortOrder
    confidence?: SortOrder
  }

  export type prediction_cacheMaxOrderByAggregateInput = {
    id?: SortOrder
    zoneId?: SortOrder
    predictedTime?: SortOrder
    predictedValue?: SortOrder
    confidence?: SortOrder
    generatedAt?: SortOrder
    expiresAt?: SortOrder
  }

  export type prediction_cacheMinOrderByAggregateInput = {
    id?: SortOrder
    zoneId?: SortOrder
    predictedTime?: SortOrder
    predictedValue?: SortOrder
    confidence?: SortOrder
    generatedAt?: SortOrder
    expiresAt?: SortOrder
  }

  export type prediction_cacheSumOrderByAggregateInput = {
    predictedValue?: SortOrder
    confidence?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type BookingsListRelationFilter = {
    every?: bookingsWhereInput
    some?: bookingsWhereInput
    none?: bookingsWhereInput
  }

  export type User_bookingsListRelationFilter = {
    every?: user_bookingsWhereInput
    some?: user_bookingsWhereInput
    none?: user_bookingsWhereInput
  }

  export type bookingsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type user_bookingsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type slotsCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    capacity?: SortOrder
    bookedCount?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type slotsAvgOrderByAggregateInput = {
    capacity?: SortOrder
    bookedCount?: SortOrder
  }

  export type slotsMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    capacity?: SortOrder
    bookedCount?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type slotsMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    capacity?: SortOrder
    bookedCount?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type slotsSumOrderByAggregateInput = {
    capacity?: SortOrder
    bookedCount?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type UsersNullableScalarRelationFilter = {
    is?: usersWhereInput | null
    isNot?: usersWhereInput | null
  }

  export type sos_alertsCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    userName?: SortOrder
    userPhone?: SortOrder
    userEmail?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    manualLocation?: SortOrder
    message?: SortOrder
    emergencyType?: SortOrder
    status?: SortOrder
    resolvedAt?: SortOrder
    resolvedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type sos_alertsAvgOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type sos_alertsMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    userName?: SortOrder
    userPhone?: SortOrder
    userEmail?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    manualLocation?: SortOrder
    message?: SortOrder
    emergencyType?: SortOrder
    status?: SortOrder
    resolvedAt?: SortOrder
    resolvedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type sos_alertsMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    userName?: SortOrder
    userPhone?: SortOrder
    userEmail?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    manualLocation?: SortOrder
    message?: SortOrder
    emergencyType?: SortOrder
    status?: SortOrder
    resolvedAt?: SortOrder
    resolvedBy?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type sos_alertsSumOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type user_bookingsCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    slotId?: SortOrder
    numberOfPeople?: SortOrder
    qrCode?: SortOrder
    status?: SortOrder
    checkedInAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type user_bookingsAvgOrderByAggregateInput = {
    numberOfPeople?: SortOrder
  }

  export type user_bookingsMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    slotId?: SortOrder
    numberOfPeople?: SortOrder
    qrCode?: SortOrder
    status?: SortOrder
    checkedInAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type user_bookingsMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    slotId?: SortOrder
    numberOfPeople?: SortOrder
    qrCode?: SortOrder
    status?: SortOrder
    checkedInAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type user_bookingsSumOrderByAggregateInput = {
    numberOfPeople?: SortOrder
  }

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type Password_reset_tokensListRelationFilter = {
    every?: password_reset_tokensWhereInput
    some?: password_reset_tokensWhereInput
    none?: password_reset_tokensWhereInput
  }

  export type Sos_alertsListRelationFilter = {
    every?: sos_alertsWhereInput
    some?: sos_alertsWhereInput
    none?: sos_alertsWhereInput
  }

  export type password_reset_tokensOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type sos_alertsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type usersCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrder
    failedLoginCount?: SortOrder
    lockedUntil?: SortOrder
    address?: SortOrder
    city?: SortOrder
    country?: SortOrder
    formattedAddress?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    pinCode?: SortOrder
    placeId?: SortOrder
    state?: SortOrder
    role?: SortOrder
  }

  export type usersAvgOrderByAggregateInput = {
    failedLoginCount?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type usersMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrder
    failedLoginCount?: SortOrder
    lockedUntil?: SortOrder
    address?: SortOrder
    city?: SortOrder
    country?: SortOrder
    formattedAddress?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    pinCode?: SortOrder
    placeId?: SortOrder
    state?: SortOrder
    role?: SortOrder
  }

  export type usersMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrder
    failedLoginCount?: SortOrder
    lockedUntil?: SortOrder
    address?: SortOrder
    city?: SortOrder
    country?: SortOrder
    formattedAddress?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    pinCode?: SortOrder
    placeId?: SortOrder
    state?: SortOrder
    role?: SortOrder
  }

  export type usersSumOrderByAggregateInput = {
    failedLoginCount?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type slotsCreateNestedOneWithoutBookingsInput = {
    create?: XOR<slotsCreateWithoutBookingsInput, slotsUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: slotsCreateOrConnectWithoutBookingsInput
    connect?: slotsWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type slotsUpdateOneRequiredWithoutBookingsNestedInput = {
    create?: XOR<slotsCreateWithoutBookingsInput, slotsUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: slotsCreateOrConnectWithoutBookingsInput
    upsert?: slotsUpsertWithoutBookingsInput
    connect?: slotsWhereUniqueInput
    update?: XOR<XOR<slotsUpdateToOneWithWhereWithoutBookingsInput, slotsUpdateWithoutBookingsInput>, slotsUncheckedUpdateWithoutBookingsInput>
  }

  export type usersCreateNestedOneWithoutPassword_reset_tokensInput = {
    create?: XOR<usersCreateWithoutPassword_reset_tokensInput, usersUncheckedCreateWithoutPassword_reset_tokensInput>
    connectOrCreate?: usersCreateOrConnectWithoutPassword_reset_tokensInput
    connect?: usersWhereUniqueInput
  }

  export type usersUpdateOneRequiredWithoutPassword_reset_tokensNestedInput = {
    create?: XOR<usersCreateWithoutPassword_reset_tokensInput, usersUncheckedCreateWithoutPassword_reset_tokensInput>
    connectOrCreate?: usersCreateOrConnectWithoutPassword_reset_tokensInput
    upsert?: usersUpsertWithoutPassword_reset_tokensInput
    connect?: usersWhereUniqueInput
    update?: XOR<XOR<usersUpdateToOneWithWhereWithoutPassword_reset_tokensInput, usersUpdateWithoutPassword_reset_tokensInput>, usersUncheckedUpdateWithoutPassword_reset_tokensInput>
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type bookingsCreateNestedManyWithoutSlotsInput = {
    create?: XOR<bookingsCreateWithoutSlotsInput, bookingsUncheckedCreateWithoutSlotsInput> | bookingsCreateWithoutSlotsInput[] | bookingsUncheckedCreateWithoutSlotsInput[]
    connectOrCreate?: bookingsCreateOrConnectWithoutSlotsInput | bookingsCreateOrConnectWithoutSlotsInput[]
    createMany?: bookingsCreateManySlotsInputEnvelope
    connect?: bookingsWhereUniqueInput | bookingsWhereUniqueInput[]
  }

  export type user_bookingsCreateNestedManyWithoutSlotsInput = {
    create?: XOR<user_bookingsCreateWithoutSlotsInput, user_bookingsUncheckedCreateWithoutSlotsInput> | user_bookingsCreateWithoutSlotsInput[] | user_bookingsUncheckedCreateWithoutSlotsInput[]
    connectOrCreate?: user_bookingsCreateOrConnectWithoutSlotsInput | user_bookingsCreateOrConnectWithoutSlotsInput[]
    createMany?: user_bookingsCreateManySlotsInputEnvelope
    connect?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
  }

  export type bookingsUncheckedCreateNestedManyWithoutSlotsInput = {
    create?: XOR<bookingsCreateWithoutSlotsInput, bookingsUncheckedCreateWithoutSlotsInput> | bookingsCreateWithoutSlotsInput[] | bookingsUncheckedCreateWithoutSlotsInput[]
    connectOrCreate?: bookingsCreateOrConnectWithoutSlotsInput | bookingsCreateOrConnectWithoutSlotsInput[]
    createMany?: bookingsCreateManySlotsInputEnvelope
    connect?: bookingsWhereUniqueInput | bookingsWhereUniqueInput[]
  }

  export type user_bookingsUncheckedCreateNestedManyWithoutSlotsInput = {
    create?: XOR<user_bookingsCreateWithoutSlotsInput, user_bookingsUncheckedCreateWithoutSlotsInput> | user_bookingsCreateWithoutSlotsInput[] | user_bookingsUncheckedCreateWithoutSlotsInput[]
    connectOrCreate?: user_bookingsCreateOrConnectWithoutSlotsInput | user_bookingsCreateOrConnectWithoutSlotsInput[]
    createMany?: user_bookingsCreateManySlotsInputEnvelope
    connect?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type bookingsUpdateManyWithoutSlotsNestedInput = {
    create?: XOR<bookingsCreateWithoutSlotsInput, bookingsUncheckedCreateWithoutSlotsInput> | bookingsCreateWithoutSlotsInput[] | bookingsUncheckedCreateWithoutSlotsInput[]
    connectOrCreate?: bookingsCreateOrConnectWithoutSlotsInput | bookingsCreateOrConnectWithoutSlotsInput[]
    upsert?: bookingsUpsertWithWhereUniqueWithoutSlotsInput | bookingsUpsertWithWhereUniqueWithoutSlotsInput[]
    createMany?: bookingsCreateManySlotsInputEnvelope
    set?: bookingsWhereUniqueInput | bookingsWhereUniqueInput[]
    disconnect?: bookingsWhereUniqueInput | bookingsWhereUniqueInput[]
    delete?: bookingsWhereUniqueInput | bookingsWhereUniqueInput[]
    connect?: bookingsWhereUniqueInput | bookingsWhereUniqueInput[]
    update?: bookingsUpdateWithWhereUniqueWithoutSlotsInput | bookingsUpdateWithWhereUniqueWithoutSlotsInput[]
    updateMany?: bookingsUpdateManyWithWhereWithoutSlotsInput | bookingsUpdateManyWithWhereWithoutSlotsInput[]
    deleteMany?: bookingsScalarWhereInput | bookingsScalarWhereInput[]
  }

  export type user_bookingsUpdateManyWithoutSlotsNestedInput = {
    create?: XOR<user_bookingsCreateWithoutSlotsInput, user_bookingsUncheckedCreateWithoutSlotsInput> | user_bookingsCreateWithoutSlotsInput[] | user_bookingsUncheckedCreateWithoutSlotsInput[]
    connectOrCreate?: user_bookingsCreateOrConnectWithoutSlotsInput | user_bookingsCreateOrConnectWithoutSlotsInput[]
    upsert?: user_bookingsUpsertWithWhereUniqueWithoutSlotsInput | user_bookingsUpsertWithWhereUniqueWithoutSlotsInput[]
    createMany?: user_bookingsCreateManySlotsInputEnvelope
    set?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    disconnect?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    delete?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    connect?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    update?: user_bookingsUpdateWithWhereUniqueWithoutSlotsInput | user_bookingsUpdateWithWhereUniqueWithoutSlotsInput[]
    updateMany?: user_bookingsUpdateManyWithWhereWithoutSlotsInput | user_bookingsUpdateManyWithWhereWithoutSlotsInput[]
    deleteMany?: user_bookingsScalarWhereInput | user_bookingsScalarWhereInput[]
  }

  export type bookingsUncheckedUpdateManyWithoutSlotsNestedInput = {
    create?: XOR<bookingsCreateWithoutSlotsInput, bookingsUncheckedCreateWithoutSlotsInput> | bookingsCreateWithoutSlotsInput[] | bookingsUncheckedCreateWithoutSlotsInput[]
    connectOrCreate?: bookingsCreateOrConnectWithoutSlotsInput | bookingsCreateOrConnectWithoutSlotsInput[]
    upsert?: bookingsUpsertWithWhereUniqueWithoutSlotsInput | bookingsUpsertWithWhereUniqueWithoutSlotsInput[]
    createMany?: bookingsCreateManySlotsInputEnvelope
    set?: bookingsWhereUniqueInput | bookingsWhereUniqueInput[]
    disconnect?: bookingsWhereUniqueInput | bookingsWhereUniqueInput[]
    delete?: bookingsWhereUniqueInput | bookingsWhereUniqueInput[]
    connect?: bookingsWhereUniqueInput | bookingsWhereUniqueInput[]
    update?: bookingsUpdateWithWhereUniqueWithoutSlotsInput | bookingsUpdateWithWhereUniqueWithoutSlotsInput[]
    updateMany?: bookingsUpdateManyWithWhereWithoutSlotsInput | bookingsUpdateManyWithWhereWithoutSlotsInput[]
    deleteMany?: bookingsScalarWhereInput | bookingsScalarWhereInput[]
  }

  export type user_bookingsUncheckedUpdateManyWithoutSlotsNestedInput = {
    create?: XOR<user_bookingsCreateWithoutSlotsInput, user_bookingsUncheckedCreateWithoutSlotsInput> | user_bookingsCreateWithoutSlotsInput[] | user_bookingsUncheckedCreateWithoutSlotsInput[]
    connectOrCreate?: user_bookingsCreateOrConnectWithoutSlotsInput | user_bookingsCreateOrConnectWithoutSlotsInput[]
    upsert?: user_bookingsUpsertWithWhereUniqueWithoutSlotsInput | user_bookingsUpsertWithWhereUniqueWithoutSlotsInput[]
    createMany?: user_bookingsCreateManySlotsInputEnvelope
    set?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    disconnect?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    delete?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    connect?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    update?: user_bookingsUpdateWithWhereUniqueWithoutSlotsInput | user_bookingsUpdateWithWhereUniqueWithoutSlotsInput[]
    updateMany?: user_bookingsUpdateManyWithWhereWithoutSlotsInput | user_bookingsUpdateManyWithWhereWithoutSlotsInput[]
    deleteMany?: user_bookingsScalarWhereInput | user_bookingsScalarWhereInput[]
  }

  export type usersCreateNestedOneWithoutSos_alertsInput = {
    create?: XOR<usersCreateWithoutSos_alertsInput, usersUncheckedCreateWithoutSos_alertsInput>
    connectOrCreate?: usersCreateOrConnectWithoutSos_alertsInput
    connect?: usersWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type usersUpdateOneWithoutSos_alertsNestedInput = {
    create?: XOR<usersCreateWithoutSos_alertsInput, usersUncheckedCreateWithoutSos_alertsInput>
    connectOrCreate?: usersCreateOrConnectWithoutSos_alertsInput
    upsert?: usersUpsertWithoutSos_alertsInput
    disconnect?: usersWhereInput | boolean
    delete?: usersWhereInput | boolean
    connect?: usersWhereUniqueInput
    update?: XOR<XOR<usersUpdateToOneWithWhereWithoutSos_alertsInput, usersUpdateWithoutSos_alertsInput>, usersUncheckedUpdateWithoutSos_alertsInput>
  }

  export type slotsCreateNestedOneWithoutUser_bookingsInput = {
    create?: XOR<slotsCreateWithoutUser_bookingsInput, slotsUncheckedCreateWithoutUser_bookingsInput>
    connectOrCreate?: slotsCreateOrConnectWithoutUser_bookingsInput
    connect?: slotsWhereUniqueInput
  }

  export type usersCreateNestedOneWithoutUser_bookingsInput = {
    create?: XOR<usersCreateWithoutUser_bookingsInput, usersUncheckedCreateWithoutUser_bookingsInput>
    connectOrCreate?: usersCreateOrConnectWithoutUser_bookingsInput
    connect?: usersWhereUniqueInput
  }

  export type slotsUpdateOneRequiredWithoutUser_bookingsNestedInput = {
    create?: XOR<slotsCreateWithoutUser_bookingsInput, slotsUncheckedCreateWithoutUser_bookingsInput>
    connectOrCreate?: slotsCreateOrConnectWithoutUser_bookingsInput
    upsert?: slotsUpsertWithoutUser_bookingsInput
    connect?: slotsWhereUniqueInput
    update?: XOR<XOR<slotsUpdateToOneWithWhereWithoutUser_bookingsInput, slotsUpdateWithoutUser_bookingsInput>, slotsUncheckedUpdateWithoutUser_bookingsInput>
  }

  export type usersUpdateOneRequiredWithoutUser_bookingsNestedInput = {
    create?: XOR<usersCreateWithoutUser_bookingsInput, usersUncheckedCreateWithoutUser_bookingsInput>
    connectOrCreate?: usersCreateOrConnectWithoutUser_bookingsInput
    upsert?: usersUpsertWithoutUser_bookingsInput
    connect?: usersWhereUniqueInput
    update?: XOR<XOR<usersUpdateToOneWithWhereWithoutUser_bookingsInput, usersUpdateWithoutUser_bookingsInput>, usersUncheckedUpdateWithoutUser_bookingsInput>
  }

  export type password_reset_tokensCreateNestedManyWithoutUsersInput = {
    create?: XOR<password_reset_tokensCreateWithoutUsersInput, password_reset_tokensUncheckedCreateWithoutUsersInput> | password_reset_tokensCreateWithoutUsersInput[] | password_reset_tokensUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: password_reset_tokensCreateOrConnectWithoutUsersInput | password_reset_tokensCreateOrConnectWithoutUsersInput[]
    createMany?: password_reset_tokensCreateManyUsersInputEnvelope
    connect?: password_reset_tokensWhereUniqueInput | password_reset_tokensWhereUniqueInput[]
  }

  export type sos_alertsCreateNestedManyWithoutUsersInput = {
    create?: XOR<sos_alertsCreateWithoutUsersInput, sos_alertsUncheckedCreateWithoutUsersInput> | sos_alertsCreateWithoutUsersInput[] | sos_alertsUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: sos_alertsCreateOrConnectWithoutUsersInput | sos_alertsCreateOrConnectWithoutUsersInput[]
    createMany?: sos_alertsCreateManyUsersInputEnvelope
    connect?: sos_alertsWhereUniqueInput | sos_alertsWhereUniqueInput[]
  }

  export type user_bookingsCreateNestedManyWithoutUsersInput = {
    create?: XOR<user_bookingsCreateWithoutUsersInput, user_bookingsUncheckedCreateWithoutUsersInput> | user_bookingsCreateWithoutUsersInput[] | user_bookingsUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: user_bookingsCreateOrConnectWithoutUsersInput | user_bookingsCreateOrConnectWithoutUsersInput[]
    createMany?: user_bookingsCreateManyUsersInputEnvelope
    connect?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
  }

  export type password_reset_tokensUncheckedCreateNestedManyWithoutUsersInput = {
    create?: XOR<password_reset_tokensCreateWithoutUsersInput, password_reset_tokensUncheckedCreateWithoutUsersInput> | password_reset_tokensCreateWithoutUsersInput[] | password_reset_tokensUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: password_reset_tokensCreateOrConnectWithoutUsersInput | password_reset_tokensCreateOrConnectWithoutUsersInput[]
    createMany?: password_reset_tokensCreateManyUsersInputEnvelope
    connect?: password_reset_tokensWhereUniqueInput | password_reset_tokensWhereUniqueInput[]
  }

  export type sos_alertsUncheckedCreateNestedManyWithoutUsersInput = {
    create?: XOR<sos_alertsCreateWithoutUsersInput, sos_alertsUncheckedCreateWithoutUsersInput> | sos_alertsCreateWithoutUsersInput[] | sos_alertsUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: sos_alertsCreateOrConnectWithoutUsersInput | sos_alertsCreateOrConnectWithoutUsersInput[]
    createMany?: sos_alertsCreateManyUsersInputEnvelope
    connect?: sos_alertsWhereUniqueInput | sos_alertsWhereUniqueInput[]
  }

  export type user_bookingsUncheckedCreateNestedManyWithoutUsersInput = {
    create?: XOR<user_bookingsCreateWithoutUsersInput, user_bookingsUncheckedCreateWithoutUsersInput> | user_bookingsCreateWithoutUsersInput[] | user_bookingsUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: user_bookingsCreateOrConnectWithoutUsersInput | user_bookingsCreateOrConnectWithoutUsersInput[]
    createMany?: user_bookingsCreateManyUsersInputEnvelope
    connect?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type password_reset_tokensUpdateManyWithoutUsersNestedInput = {
    create?: XOR<password_reset_tokensCreateWithoutUsersInput, password_reset_tokensUncheckedCreateWithoutUsersInput> | password_reset_tokensCreateWithoutUsersInput[] | password_reset_tokensUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: password_reset_tokensCreateOrConnectWithoutUsersInput | password_reset_tokensCreateOrConnectWithoutUsersInput[]
    upsert?: password_reset_tokensUpsertWithWhereUniqueWithoutUsersInput | password_reset_tokensUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: password_reset_tokensCreateManyUsersInputEnvelope
    set?: password_reset_tokensWhereUniqueInput | password_reset_tokensWhereUniqueInput[]
    disconnect?: password_reset_tokensWhereUniqueInput | password_reset_tokensWhereUniqueInput[]
    delete?: password_reset_tokensWhereUniqueInput | password_reset_tokensWhereUniqueInput[]
    connect?: password_reset_tokensWhereUniqueInput | password_reset_tokensWhereUniqueInput[]
    update?: password_reset_tokensUpdateWithWhereUniqueWithoutUsersInput | password_reset_tokensUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: password_reset_tokensUpdateManyWithWhereWithoutUsersInput | password_reset_tokensUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: password_reset_tokensScalarWhereInput | password_reset_tokensScalarWhereInput[]
  }

  export type sos_alertsUpdateManyWithoutUsersNestedInput = {
    create?: XOR<sos_alertsCreateWithoutUsersInput, sos_alertsUncheckedCreateWithoutUsersInput> | sos_alertsCreateWithoutUsersInput[] | sos_alertsUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: sos_alertsCreateOrConnectWithoutUsersInput | sos_alertsCreateOrConnectWithoutUsersInput[]
    upsert?: sos_alertsUpsertWithWhereUniqueWithoutUsersInput | sos_alertsUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: sos_alertsCreateManyUsersInputEnvelope
    set?: sos_alertsWhereUniqueInput | sos_alertsWhereUniqueInput[]
    disconnect?: sos_alertsWhereUniqueInput | sos_alertsWhereUniqueInput[]
    delete?: sos_alertsWhereUniqueInput | sos_alertsWhereUniqueInput[]
    connect?: sos_alertsWhereUniqueInput | sos_alertsWhereUniqueInput[]
    update?: sos_alertsUpdateWithWhereUniqueWithoutUsersInput | sos_alertsUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: sos_alertsUpdateManyWithWhereWithoutUsersInput | sos_alertsUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: sos_alertsScalarWhereInput | sos_alertsScalarWhereInput[]
  }

  export type user_bookingsUpdateManyWithoutUsersNestedInput = {
    create?: XOR<user_bookingsCreateWithoutUsersInput, user_bookingsUncheckedCreateWithoutUsersInput> | user_bookingsCreateWithoutUsersInput[] | user_bookingsUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: user_bookingsCreateOrConnectWithoutUsersInput | user_bookingsCreateOrConnectWithoutUsersInput[]
    upsert?: user_bookingsUpsertWithWhereUniqueWithoutUsersInput | user_bookingsUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: user_bookingsCreateManyUsersInputEnvelope
    set?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    disconnect?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    delete?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    connect?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    update?: user_bookingsUpdateWithWhereUniqueWithoutUsersInput | user_bookingsUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: user_bookingsUpdateManyWithWhereWithoutUsersInput | user_bookingsUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: user_bookingsScalarWhereInput | user_bookingsScalarWhereInput[]
  }

  export type password_reset_tokensUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: XOR<password_reset_tokensCreateWithoutUsersInput, password_reset_tokensUncheckedCreateWithoutUsersInput> | password_reset_tokensCreateWithoutUsersInput[] | password_reset_tokensUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: password_reset_tokensCreateOrConnectWithoutUsersInput | password_reset_tokensCreateOrConnectWithoutUsersInput[]
    upsert?: password_reset_tokensUpsertWithWhereUniqueWithoutUsersInput | password_reset_tokensUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: password_reset_tokensCreateManyUsersInputEnvelope
    set?: password_reset_tokensWhereUniqueInput | password_reset_tokensWhereUniqueInput[]
    disconnect?: password_reset_tokensWhereUniqueInput | password_reset_tokensWhereUniqueInput[]
    delete?: password_reset_tokensWhereUniqueInput | password_reset_tokensWhereUniqueInput[]
    connect?: password_reset_tokensWhereUniqueInput | password_reset_tokensWhereUniqueInput[]
    update?: password_reset_tokensUpdateWithWhereUniqueWithoutUsersInput | password_reset_tokensUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: password_reset_tokensUpdateManyWithWhereWithoutUsersInput | password_reset_tokensUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: password_reset_tokensScalarWhereInput | password_reset_tokensScalarWhereInput[]
  }

  export type sos_alertsUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: XOR<sos_alertsCreateWithoutUsersInput, sos_alertsUncheckedCreateWithoutUsersInput> | sos_alertsCreateWithoutUsersInput[] | sos_alertsUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: sos_alertsCreateOrConnectWithoutUsersInput | sos_alertsCreateOrConnectWithoutUsersInput[]
    upsert?: sos_alertsUpsertWithWhereUniqueWithoutUsersInput | sos_alertsUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: sos_alertsCreateManyUsersInputEnvelope
    set?: sos_alertsWhereUniqueInput | sos_alertsWhereUniqueInput[]
    disconnect?: sos_alertsWhereUniqueInput | sos_alertsWhereUniqueInput[]
    delete?: sos_alertsWhereUniqueInput | sos_alertsWhereUniqueInput[]
    connect?: sos_alertsWhereUniqueInput | sos_alertsWhereUniqueInput[]
    update?: sos_alertsUpdateWithWhereUniqueWithoutUsersInput | sos_alertsUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: sos_alertsUpdateManyWithWhereWithoutUsersInput | sos_alertsUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: sos_alertsScalarWhereInput | sos_alertsScalarWhereInput[]
  }

  export type user_bookingsUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: XOR<user_bookingsCreateWithoutUsersInput, user_bookingsUncheckedCreateWithoutUsersInput> | user_bookingsCreateWithoutUsersInput[] | user_bookingsUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: user_bookingsCreateOrConnectWithoutUsersInput | user_bookingsCreateOrConnectWithoutUsersInput[]
    upsert?: user_bookingsUpsertWithWhereUniqueWithoutUsersInput | user_bookingsUpsertWithWhereUniqueWithoutUsersInput[]
    createMany?: user_bookingsCreateManyUsersInputEnvelope
    set?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    disconnect?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    delete?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    connect?: user_bookingsWhereUniqueInput | user_bookingsWhereUniqueInput[]
    update?: user_bookingsUpdateWithWhereUniqueWithoutUsersInput | user_bookingsUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: user_bookingsUpdateManyWithWhereWithoutUsersInput | user_bookingsUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: user_bookingsScalarWhereInput | user_bookingsScalarWhereInput[]
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type slotsCreateWithoutBookingsInput = {
    id: string
    date: Date | string
    startTime: string
    endTime: string
    capacity: number
    bookedCount?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt: Date | string
    user_bookings?: user_bookingsCreateNestedManyWithoutSlotsInput
  }

  export type slotsUncheckedCreateWithoutBookingsInput = {
    id: string
    date: Date | string
    startTime: string
    endTime: string
    capacity: number
    bookedCount?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt: Date | string
    user_bookings?: user_bookingsUncheckedCreateNestedManyWithoutSlotsInput
  }

  export type slotsCreateOrConnectWithoutBookingsInput = {
    where: slotsWhereUniqueInput
    create: XOR<slotsCreateWithoutBookingsInput, slotsUncheckedCreateWithoutBookingsInput>
  }

  export type slotsUpsertWithoutBookingsInput = {
    update: XOR<slotsUpdateWithoutBookingsInput, slotsUncheckedUpdateWithoutBookingsInput>
    create: XOR<slotsCreateWithoutBookingsInput, slotsUncheckedCreateWithoutBookingsInput>
    where?: slotsWhereInput
  }

  export type slotsUpdateToOneWithWhereWithoutBookingsInput = {
    where?: slotsWhereInput
    data: XOR<slotsUpdateWithoutBookingsInput, slotsUncheckedUpdateWithoutBookingsInput>
  }

  export type slotsUpdateWithoutBookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    bookedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user_bookings?: user_bookingsUpdateManyWithoutSlotsNestedInput
  }

  export type slotsUncheckedUpdateWithoutBookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    bookedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user_bookings?: user_bookingsUncheckedUpdateManyWithoutSlotsNestedInput
  }

  export type usersCreateWithoutPassword_reset_tokensInput = {
    id: string
    email: string
    passwordHash: string
    name?: string | null
    phone?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    lastLoginAt?: Date | string | null
    failedLoginCount?: number
    lockedUntil?: Date | string | null
    address?: string | null
    city?: string | null
    country?: string | null
    formattedAddress?: string | null
    latitude?: number | null
    longitude?: number | null
    pinCode?: string | null
    placeId?: string | null
    state?: string | null
    role?: $Enums.UserRole
    sos_alerts?: sos_alertsCreateNestedManyWithoutUsersInput
    user_bookings?: user_bookingsCreateNestedManyWithoutUsersInput
  }

  export type usersUncheckedCreateWithoutPassword_reset_tokensInput = {
    id: string
    email: string
    passwordHash: string
    name?: string | null
    phone?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    lastLoginAt?: Date | string | null
    failedLoginCount?: number
    lockedUntil?: Date | string | null
    address?: string | null
    city?: string | null
    country?: string | null
    formattedAddress?: string | null
    latitude?: number | null
    longitude?: number | null
    pinCode?: string | null
    placeId?: string | null
    state?: string | null
    role?: $Enums.UserRole
    sos_alerts?: sos_alertsUncheckedCreateNestedManyWithoutUsersInput
    user_bookings?: user_bookingsUncheckedCreateNestedManyWithoutUsersInput
  }

  export type usersCreateOrConnectWithoutPassword_reset_tokensInput = {
    where: usersWhereUniqueInput
    create: XOR<usersCreateWithoutPassword_reset_tokensInput, usersUncheckedCreateWithoutPassword_reset_tokensInput>
  }

  export type usersUpsertWithoutPassword_reset_tokensInput = {
    update: XOR<usersUpdateWithoutPassword_reset_tokensInput, usersUncheckedUpdateWithoutPassword_reset_tokensInput>
    create: XOR<usersCreateWithoutPassword_reset_tokensInput, usersUncheckedCreateWithoutPassword_reset_tokensInput>
    where?: usersWhereInput
  }

  export type usersUpdateToOneWithWhereWithoutPassword_reset_tokensInput = {
    where?: usersWhereInput
    data: XOR<usersUpdateWithoutPassword_reset_tokensInput, usersUncheckedUpdateWithoutPassword_reset_tokensInput>
  }

  export type usersUpdateWithoutPassword_reset_tokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginCount?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    formattedAddress?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    pinCode?: NullableStringFieldUpdateOperationsInput | string | null
    placeId?: NullableStringFieldUpdateOperationsInput | string | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    sos_alerts?: sos_alertsUpdateManyWithoutUsersNestedInput
    user_bookings?: user_bookingsUpdateManyWithoutUsersNestedInput
  }

  export type usersUncheckedUpdateWithoutPassword_reset_tokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginCount?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    formattedAddress?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    pinCode?: NullableStringFieldUpdateOperationsInput | string | null
    placeId?: NullableStringFieldUpdateOperationsInput | string | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    sos_alerts?: sos_alertsUncheckedUpdateManyWithoutUsersNestedInput
    user_bookings?: user_bookingsUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type bookingsCreateWithoutSlotsInput = {
    id: string
    name: string
    phone: string
    email: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type bookingsUncheckedCreateWithoutSlotsInput = {
    id: string
    name: string
    phone: string
    email: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type bookingsCreateOrConnectWithoutSlotsInput = {
    where: bookingsWhereUniqueInput
    create: XOR<bookingsCreateWithoutSlotsInput, bookingsUncheckedCreateWithoutSlotsInput>
  }

  export type bookingsCreateManySlotsInputEnvelope = {
    data: bookingsCreateManySlotsInput | bookingsCreateManySlotsInput[]
    skipDuplicates?: boolean
  }

  export type user_bookingsCreateWithoutSlotsInput = {
    id: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
    users: usersCreateNestedOneWithoutUser_bookingsInput
  }

  export type user_bookingsUncheckedCreateWithoutSlotsInput = {
    id: string
    userId: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type user_bookingsCreateOrConnectWithoutSlotsInput = {
    where: user_bookingsWhereUniqueInput
    create: XOR<user_bookingsCreateWithoutSlotsInput, user_bookingsUncheckedCreateWithoutSlotsInput>
  }

  export type user_bookingsCreateManySlotsInputEnvelope = {
    data: user_bookingsCreateManySlotsInput | user_bookingsCreateManySlotsInput[]
    skipDuplicates?: boolean
  }

  export type bookingsUpsertWithWhereUniqueWithoutSlotsInput = {
    where: bookingsWhereUniqueInput
    update: XOR<bookingsUpdateWithoutSlotsInput, bookingsUncheckedUpdateWithoutSlotsInput>
    create: XOR<bookingsCreateWithoutSlotsInput, bookingsUncheckedCreateWithoutSlotsInput>
  }

  export type bookingsUpdateWithWhereUniqueWithoutSlotsInput = {
    where: bookingsWhereUniqueInput
    data: XOR<bookingsUpdateWithoutSlotsInput, bookingsUncheckedUpdateWithoutSlotsInput>
  }

  export type bookingsUpdateManyWithWhereWithoutSlotsInput = {
    where: bookingsScalarWhereInput
    data: XOR<bookingsUpdateManyMutationInput, bookingsUncheckedUpdateManyWithoutSlotsInput>
  }

  export type bookingsScalarWhereInput = {
    AND?: bookingsScalarWhereInput | bookingsScalarWhereInput[]
    OR?: bookingsScalarWhereInput[]
    NOT?: bookingsScalarWhereInput | bookingsScalarWhereInput[]
    id?: StringFilter<"bookings"> | string
    slotId?: StringFilter<"bookings"> | string
    name?: StringFilter<"bookings"> | string
    phone?: StringFilter<"bookings"> | string
    email?: StringFilter<"bookings"> | string
    numberOfPeople?: IntFilter<"bookings"> | number
    qrCode?: StringFilter<"bookings"> | string
    status?: StringFilter<"bookings"> | string
    checkedInAt?: DateTimeNullableFilter<"bookings"> | Date | string | null
    createdAt?: DateTimeFilter<"bookings"> | Date | string
    updatedAt?: DateTimeFilter<"bookings"> | Date | string
  }

  export type user_bookingsUpsertWithWhereUniqueWithoutSlotsInput = {
    where: user_bookingsWhereUniqueInput
    update: XOR<user_bookingsUpdateWithoutSlotsInput, user_bookingsUncheckedUpdateWithoutSlotsInput>
    create: XOR<user_bookingsCreateWithoutSlotsInput, user_bookingsUncheckedCreateWithoutSlotsInput>
  }

  export type user_bookingsUpdateWithWhereUniqueWithoutSlotsInput = {
    where: user_bookingsWhereUniqueInput
    data: XOR<user_bookingsUpdateWithoutSlotsInput, user_bookingsUncheckedUpdateWithoutSlotsInput>
  }

  export type user_bookingsUpdateManyWithWhereWithoutSlotsInput = {
    where: user_bookingsScalarWhereInput
    data: XOR<user_bookingsUpdateManyMutationInput, user_bookingsUncheckedUpdateManyWithoutSlotsInput>
  }

  export type user_bookingsScalarWhereInput = {
    AND?: user_bookingsScalarWhereInput | user_bookingsScalarWhereInput[]
    OR?: user_bookingsScalarWhereInput[]
    NOT?: user_bookingsScalarWhereInput | user_bookingsScalarWhereInput[]
    id?: StringFilter<"user_bookings"> | string
    userId?: StringFilter<"user_bookings"> | string
    slotId?: StringFilter<"user_bookings"> | string
    numberOfPeople?: IntFilter<"user_bookings"> | number
    qrCode?: StringFilter<"user_bookings"> | string
    status?: StringFilter<"user_bookings"> | string
    checkedInAt?: DateTimeNullableFilter<"user_bookings"> | Date | string | null
    createdAt?: DateTimeFilter<"user_bookings"> | Date | string
    updatedAt?: DateTimeFilter<"user_bookings"> | Date | string
  }

  export type usersCreateWithoutSos_alertsInput = {
    id: string
    email: string
    passwordHash: string
    name?: string | null
    phone?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    lastLoginAt?: Date | string | null
    failedLoginCount?: number
    lockedUntil?: Date | string | null
    address?: string | null
    city?: string | null
    country?: string | null
    formattedAddress?: string | null
    latitude?: number | null
    longitude?: number | null
    pinCode?: string | null
    placeId?: string | null
    state?: string | null
    role?: $Enums.UserRole
    password_reset_tokens?: password_reset_tokensCreateNestedManyWithoutUsersInput
    user_bookings?: user_bookingsCreateNestedManyWithoutUsersInput
  }

  export type usersUncheckedCreateWithoutSos_alertsInput = {
    id: string
    email: string
    passwordHash: string
    name?: string | null
    phone?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    lastLoginAt?: Date | string | null
    failedLoginCount?: number
    lockedUntil?: Date | string | null
    address?: string | null
    city?: string | null
    country?: string | null
    formattedAddress?: string | null
    latitude?: number | null
    longitude?: number | null
    pinCode?: string | null
    placeId?: string | null
    state?: string | null
    role?: $Enums.UserRole
    password_reset_tokens?: password_reset_tokensUncheckedCreateNestedManyWithoutUsersInput
    user_bookings?: user_bookingsUncheckedCreateNestedManyWithoutUsersInput
  }

  export type usersCreateOrConnectWithoutSos_alertsInput = {
    where: usersWhereUniqueInput
    create: XOR<usersCreateWithoutSos_alertsInput, usersUncheckedCreateWithoutSos_alertsInput>
  }

  export type usersUpsertWithoutSos_alertsInput = {
    update: XOR<usersUpdateWithoutSos_alertsInput, usersUncheckedUpdateWithoutSos_alertsInput>
    create: XOR<usersCreateWithoutSos_alertsInput, usersUncheckedCreateWithoutSos_alertsInput>
    where?: usersWhereInput
  }

  export type usersUpdateToOneWithWhereWithoutSos_alertsInput = {
    where?: usersWhereInput
    data: XOR<usersUpdateWithoutSos_alertsInput, usersUncheckedUpdateWithoutSos_alertsInput>
  }

  export type usersUpdateWithoutSos_alertsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginCount?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    formattedAddress?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    pinCode?: NullableStringFieldUpdateOperationsInput | string | null
    placeId?: NullableStringFieldUpdateOperationsInput | string | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    password_reset_tokens?: password_reset_tokensUpdateManyWithoutUsersNestedInput
    user_bookings?: user_bookingsUpdateManyWithoutUsersNestedInput
  }

  export type usersUncheckedUpdateWithoutSos_alertsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginCount?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    formattedAddress?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    pinCode?: NullableStringFieldUpdateOperationsInput | string | null
    placeId?: NullableStringFieldUpdateOperationsInput | string | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    password_reset_tokens?: password_reset_tokensUncheckedUpdateManyWithoutUsersNestedInput
    user_bookings?: user_bookingsUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type slotsCreateWithoutUser_bookingsInput = {
    id: string
    date: Date | string
    startTime: string
    endTime: string
    capacity: number
    bookedCount?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt: Date | string
    bookings?: bookingsCreateNestedManyWithoutSlotsInput
  }

  export type slotsUncheckedCreateWithoutUser_bookingsInput = {
    id: string
    date: Date | string
    startTime: string
    endTime: string
    capacity: number
    bookedCount?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt: Date | string
    bookings?: bookingsUncheckedCreateNestedManyWithoutSlotsInput
  }

  export type slotsCreateOrConnectWithoutUser_bookingsInput = {
    where: slotsWhereUniqueInput
    create: XOR<slotsCreateWithoutUser_bookingsInput, slotsUncheckedCreateWithoutUser_bookingsInput>
  }

  export type usersCreateWithoutUser_bookingsInput = {
    id: string
    email: string
    passwordHash: string
    name?: string | null
    phone?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    lastLoginAt?: Date | string | null
    failedLoginCount?: number
    lockedUntil?: Date | string | null
    address?: string | null
    city?: string | null
    country?: string | null
    formattedAddress?: string | null
    latitude?: number | null
    longitude?: number | null
    pinCode?: string | null
    placeId?: string | null
    state?: string | null
    role?: $Enums.UserRole
    password_reset_tokens?: password_reset_tokensCreateNestedManyWithoutUsersInput
    sos_alerts?: sos_alertsCreateNestedManyWithoutUsersInput
  }

  export type usersUncheckedCreateWithoutUser_bookingsInput = {
    id: string
    email: string
    passwordHash: string
    name?: string | null
    phone?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
    lastLoginAt?: Date | string | null
    failedLoginCount?: number
    lockedUntil?: Date | string | null
    address?: string | null
    city?: string | null
    country?: string | null
    formattedAddress?: string | null
    latitude?: number | null
    longitude?: number | null
    pinCode?: string | null
    placeId?: string | null
    state?: string | null
    role?: $Enums.UserRole
    password_reset_tokens?: password_reset_tokensUncheckedCreateNestedManyWithoutUsersInput
    sos_alerts?: sos_alertsUncheckedCreateNestedManyWithoutUsersInput
  }

  export type usersCreateOrConnectWithoutUser_bookingsInput = {
    where: usersWhereUniqueInput
    create: XOR<usersCreateWithoutUser_bookingsInput, usersUncheckedCreateWithoutUser_bookingsInput>
  }

  export type slotsUpsertWithoutUser_bookingsInput = {
    update: XOR<slotsUpdateWithoutUser_bookingsInput, slotsUncheckedUpdateWithoutUser_bookingsInput>
    create: XOR<slotsCreateWithoutUser_bookingsInput, slotsUncheckedCreateWithoutUser_bookingsInput>
    where?: slotsWhereInput
  }

  export type slotsUpdateToOneWithWhereWithoutUser_bookingsInput = {
    where?: slotsWhereInput
    data: XOR<slotsUpdateWithoutUser_bookingsInput, slotsUncheckedUpdateWithoutUser_bookingsInput>
  }

  export type slotsUpdateWithoutUser_bookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    bookedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: bookingsUpdateManyWithoutSlotsNestedInput
  }

  export type slotsUncheckedUpdateWithoutUser_bookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    bookedCount?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: bookingsUncheckedUpdateManyWithoutSlotsNestedInput
  }

  export type usersUpsertWithoutUser_bookingsInput = {
    update: XOR<usersUpdateWithoutUser_bookingsInput, usersUncheckedUpdateWithoutUser_bookingsInput>
    create: XOR<usersCreateWithoutUser_bookingsInput, usersUncheckedCreateWithoutUser_bookingsInput>
    where?: usersWhereInput
  }

  export type usersUpdateToOneWithWhereWithoutUser_bookingsInput = {
    where?: usersWhereInput
    data: XOR<usersUpdateWithoutUser_bookingsInput, usersUncheckedUpdateWithoutUser_bookingsInput>
  }

  export type usersUpdateWithoutUser_bookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginCount?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    formattedAddress?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    pinCode?: NullableStringFieldUpdateOperationsInput | string | null
    placeId?: NullableStringFieldUpdateOperationsInput | string | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    password_reset_tokens?: password_reset_tokensUpdateManyWithoutUsersNestedInput
    sos_alerts?: sos_alertsUpdateManyWithoutUsersNestedInput
  }

  export type usersUncheckedUpdateWithoutUser_bookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginCount?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    formattedAddress?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    pinCode?: NullableStringFieldUpdateOperationsInput | string | null
    placeId?: NullableStringFieldUpdateOperationsInput | string | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    password_reset_tokens?: password_reset_tokensUncheckedUpdateManyWithoutUsersNestedInput
    sos_alerts?: sos_alertsUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type password_reset_tokensCreateWithoutUsersInput = {
    id: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
    usedAt?: Date | string | null
  }

  export type password_reset_tokensUncheckedCreateWithoutUsersInput = {
    id: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
    usedAt?: Date | string | null
  }

  export type password_reset_tokensCreateOrConnectWithoutUsersInput = {
    where: password_reset_tokensWhereUniqueInput
    create: XOR<password_reset_tokensCreateWithoutUsersInput, password_reset_tokensUncheckedCreateWithoutUsersInput>
  }

  export type password_reset_tokensCreateManyUsersInputEnvelope = {
    data: password_reset_tokensCreateManyUsersInput | password_reset_tokensCreateManyUsersInput[]
    skipDuplicates?: boolean
  }

  export type sos_alertsCreateWithoutUsersInput = {
    id: string
    userName?: string | null
    userPhone?: string | null
    userEmail?: string | null
    latitude?: number | null
    longitude?: number | null
    manualLocation?: string | null
    message?: string | null
    emergencyType: string
    status?: string
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type sos_alertsUncheckedCreateWithoutUsersInput = {
    id: string
    userName?: string | null
    userPhone?: string | null
    userEmail?: string | null
    latitude?: number | null
    longitude?: number | null
    manualLocation?: string | null
    message?: string | null
    emergencyType: string
    status?: string
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type sos_alertsCreateOrConnectWithoutUsersInput = {
    where: sos_alertsWhereUniqueInput
    create: XOR<sos_alertsCreateWithoutUsersInput, sos_alertsUncheckedCreateWithoutUsersInput>
  }

  export type sos_alertsCreateManyUsersInputEnvelope = {
    data: sos_alertsCreateManyUsersInput | sos_alertsCreateManyUsersInput[]
    skipDuplicates?: boolean
  }

  export type user_bookingsCreateWithoutUsersInput = {
    id: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
    slots: slotsCreateNestedOneWithoutUser_bookingsInput
  }

  export type user_bookingsUncheckedCreateWithoutUsersInput = {
    id: string
    slotId: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type user_bookingsCreateOrConnectWithoutUsersInput = {
    where: user_bookingsWhereUniqueInput
    create: XOR<user_bookingsCreateWithoutUsersInput, user_bookingsUncheckedCreateWithoutUsersInput>
  }

  export type user_bookingsCreateManyUsersInputEnvelope = {
    data: user_bookingsCreateManyUsersInput | user_bookingsCreateManyUsersInput[]
    skipDuplicates?: boolean
  }

  export type password_reset_tokensUpsertWithWhereUniqueWithoutUsersInput = {
    where: password_reset_tokensWhereUniqueInput
    update: XOR<password_reset_tokensUpdateWithoutUsersInput, password_reset_tokensUncheckedUpdateWithoutUsersInput>
    create: XOR<password_reset_tokensCreateWithoutUsersInput, password_reset_tokensUncheckedCreateWithoutUsersInput>
  }

  export type password_reset_tokensUpdateWithWhereUniqueWithoutUsersInput = {
    where: password_reset_tokensWhereUniqueInput
    data: XOR<password_reset_tokensUpdateWithoutUsersInput, password_reset_tokensUncheckedUpdateWithoutUsersInput>
  }

  export type password_reset_tokensUpdateManyWithWhereWithoutUsersInput = {
    where: password_reset_tokensScalarWhereInput
    data: XOR<password_reset_tokensUpdateManyMutationInput, password_reset_tokensUncheckedUpdateManyWithoutUsersInput>
  }

  export type password_reset_tokensScalarWhereInput = {
    AND?: password_reset_tokensScalarWhereInput | password_reset_tokensScalarWhereInput[]
    OR?: password_reset_tokensScalarWhereInput[]
    NOT?: password_reset_tokensScalarWhereInput | password_reset_tokensScalarWhereInput[]
    id?: StringFilter<"password_reset_tokens"> | string
    userId?: StringFilter<"password_reset_tokens"> | string
    token?: StringFilter<"password_reset_tokens"> | string
    expiresAt?: DateTimeFilter<"password_reset_tokens"> | Date | string
    createdAt?: DateTimeFilter<"password_reset_tokens"> | Date | string
    usedAt?: DateTimeNullableFilter<"password_reset_tokens"> | Date | string | null
  }

  export type sos_alertsUpsertWithWhereUniqueWithoutUsersInput = {
    where: sos_alertsWhereUniqueInput
    update: XOR<sos_alertsUpdateWithoutUsersInput, sos_alertsUncheckedUpdateWithoutUsersInput>
    create: XOR<sos_alertsCreateWithoutUsersInput, sos_alertsUncheckedCreateWithoutUsersInput>
  }

  export type sos_alertsUpdateWithWhereUniqueWithoutUsersInput = {
    where: sos_alertsWhereUniqueInput
    data: XOR<sos_alertsUpdateWithoutUsersInput, sos_alertsUncheckedUpdateWithoutUsersInput>
  }

  export type sos_alertsUpdateManyWithWhereWithoutUsersInput = {
    where: sos_alertsScalarWhereInput
    data: XOR<sos_alertsUpdateManyMutationInput, sos_alertsUncheckedUpdateManyWithoutUsersInput>
  }

  export type sos_alertsScalarWhereInput = {
    AND?: sos_alertsScalarWhereInput | sos_alertsScalarWhereInput[]
    OR?: sos_alertsScalarWhereInput[]
    NOT?: sos_alertsScalarWhereInput | sos_alertsScalarWhereInput[]
    id?: StringFilter<"sos_alerts"> | string
    userId?: StringNullableFilter<"sos_alerts"> | string | null
    userName?: StringNullableFilter<"sos_alerts"> | string | null
    userPhone?: StringNullableFilter<"sos_alerts"> | string | null
    userEmail?: StringNullableFilter<"sos_alerts"> | string | null
    latitude?: FloatNullableFilter<"sos_alerts"> | number | null
    longitude?: FloatNullableFilter<"sos_alerts"> | number | null
    manualLocation?: StringNullableFilter<"sos_alerts"> | string | null
    message?: StringNullableFilter<"sos_alerts"> | string | null
    emergencyType?: StringFilter<"sos_alerts"> | string
    status?: StringFilter<"sos_alerts"> | string
    resolvedAt?: DateTimeNullableFilter<"sos_alerts"> | Date | string | null
    resolvedBy?: StringNullableFilter<"sos_alerts"> | string | null
    createdAt?: DateTimeFilter<"sos_alerts"> | Date | string
    updatedAt?: DateTimeFilter<"sos_alerts"> | Date | string
  }

  export type user_bookingsUpsertWithWhereUniqueWithoutUsersInput = {
    where: user_bookingsWhereUniqueInput
    update: XOR<user_bookingsUpdateWithoutUsersInput, user_bookingsUncheckedUpdateWithoutUsersInput>
    create: XOR<user_bookingsCreateWithoutUsersInput, user_bookingsUncheckedCreateWithoutUsersInput>
  }

  export type user_bookingsUpdateWithWhereUniqueWithoutUsersInput = {
    where: user_bookingsWhereUniqueInput
    data: XOR<user_bookingsUpdateWithoutUsersInput, user_bookingsUncheckedUpdateWithoutUsersInput>
  }

  export type user_bookingsUpdateManyWithWhereWithoutUsersInput = {
    where: user_bookingsScalarWhereInput
    data: XOR<user_bookingsUpdateManyMutationInput, user_bookingsUncheckedUpdateManyWithoutUsersInput>
  }

  export type bookingsCreateManySlotsInput = {
    id: string
    name: string
    phone: string
    email: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type user_bookingsCreateManySlotsInput = {
    id: string
    userId: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type bookingsUpdateWithoutSlotsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type bookingsUncheckedUpdateWithoutSlotsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type bookingsUncheckedUpdateManyWithoutSlotsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type user_bookingsUpdateWithoutSlotsInput = {
    id?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: usersUpdateOneRequiredWithoutUser_bookingsNestedInput
  }

  export type user_bookingsUncheckedUpdateWithoutSlotsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type user_bookingsUncheckedUpdateManyWithoutSlotsInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type password_reset_tokensCreateManyUsersInput = {
    id: string
    token: string
    expiresAt: Date | string
    createdAt?: Date | string
    usedAt?: Date | string | null
  }

  export type sos_alertsCreateManyUsersInput = {
    id: string
    userName?: string | null
    userPhone?: string | null
    userEmail?: string | null
    latitude?: number | null
    longitude?: number | null
    manualLocation?: string | null
    message?: string | null
    emergencyType: string
    status?: string
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type user_bookingsCreateManyUsersInput = {
    id: string
    slotId: string
    numberOfPeople: number
    qrCode: string
    status?: string
    checkedInAt?: Date | string | null
    createdAt?: Date | string
    updatedAt: Date | string
  }

  export type password_reset_tokensUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type password_reset_tokensUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type password_reset_tokensUncheckedUpdateManyWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type sos_alertsUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userPhone?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    manualLocation?: NullableStringFieldUpdateOperationsInput | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type sos_alertsUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userPhone?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    manualLocation?: NullableStringFieldUpdateOperationsInput | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type sos_alertsUncheckedUpdateManyWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    userName?: NullableStringFieldUpdateOperationsInput | string | null
    userPhone?: NullableStringFieldUpdateOperationsInput | string | null
    userEmail?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    manualLocation?: NullableStringFieldUpdateOperationsInput | string | null
    message?: NullableStringFieldUpdateOperationsInput | string | null
    emergencyType?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type user_bookingsUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    slots?: slotsUpdateOneRequiredWithoutUser_bookingsNestedInput
  }

  export type user_bookingsUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    slotId?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type user_bookingsUncheckedUpdateManyWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    slotId?: StringFieldUpdateOperationsInput | string
    numberOfPeople?: IntFieldUpdateOperationsInput | number
    qrCode?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
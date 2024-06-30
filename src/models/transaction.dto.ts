import { EventType, ObjectType, StatusType } from '@/enums/event_type'
import { Schema as S } from '@effect/schema'

export namespace Customer {
  export namespace Subscription {
    const Plan = S.Struct({
      id: S.String,
      active: S.Boolean,
      amount: S.Int
    })

    // biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
    const Object = S.Struct({
      id: S.String,
      object: S.Enums(ObjectType),
      current_period_end: S.Int,
      current_period_start: S.Int,
      customer: S.String,
      status: S.Enums(StatusType),
      plan: Plan
    })

    const Data = S.Struct({
      object: Object
    })

    export const Created = S.Struct({
      id: S.String,
      api_versioN: S.String,
      created: S.Int,
      type: S.Enums(EventType),
      data: Data
    })
  }
}

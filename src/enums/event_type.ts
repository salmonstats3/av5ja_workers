export enum EventType {
  CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed',
  CUSTOMER_SUBSCRIPTION_CREATED = 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_DELETED = 'customer.subscription.deleted',
  CUSTOMER_SUBSCRIPTION_UPDATED = 'customer.subscription.updated',
  INVOICE_PAYMENT_FAILED = 'invoice.payment_failed',
  INVOICE_PAYMENT_SUCCEEDED = 'invoice.payment_succeeded'
}

export enum ObjectType {
  SUBSCRIPTION = 'subscription',
  CHARGE = 'charge',
  CUSTOMER = 'customer',
  INVOICE = 'invoice',
  PAYMENT_INTENT = 'payment_intent'
}

export enum StatusType {
  ACTIVE = 'active'
}
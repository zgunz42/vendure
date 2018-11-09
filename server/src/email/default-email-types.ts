import { LanguageCode } from 'shared/generated-types';
import { DEFAULT_CHANNEL_CODE } from 'shared/shared-constants';

import { configEmailType, EmailTypes } from '../config/email/email-options';

import { OrderStateTransitionEvent } from '../event-bus/events/order-state-transition-event';

export type DefaultEmailType = 'order-receipt';

export const defaultEmailTypes: EmailTypes<DefaultEmailType> = {
    'order-receipt': configEmailType({
        triggerEvent: OrderStateTransitionEvent,
        createContext: e => {
            const customer = e.order.customer;
            if (customer && e.toState === 'PaymentSettled') {
                return {
                    recipient: customer.emailAddress,
                    languageCode: e.ctx.languageCode,
                    channelCode: e.ctx.channel.code,
                };
            }
        },
        templates: {
            defaultChannel: {
                defaultLanguage: {
                    subject: data => `Your order receipt`,
                    templatePath: 'awd',
                },
            },
        },
    }),
};
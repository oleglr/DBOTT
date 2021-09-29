import { info }         from '../utils/broadcast';
import { roundBalance } from '../utils/helpers';

let balanceStr = '';

export default Engine =>
    class Balance extends Engine {
        observeBalance() {
            this.listen('balance', r => {
                const {
                    balance: { balance: b, currency },
                } = r;

                this.balance = roundBalance({ currency, balance: b });
                balanceStr = `${this.balance} ${currency}`;

                info({ accountID: this.accountInfo.loginid, balance: balanceStr });
            });
        }

        // eslint-disable-next-line class-methods-use-this
        getBalance(type) {
            const { scope } = this.store.getState();
            let { balance } = this;

            // Deduct trade `amount` in this scope for correct value in `balance`-block
            if (scope === 'BEFORE_PURCHASE') {
                balance = roundBalance({
                    currency: this.tradeOptions.currency,
                    balance : Number(balance) - this.tradeOptions.amount,
                });
                balanceStr = `${balance} ${this.tradeOptions.currency}`;
            }

            return type === 'STR' ? balanceStr : Number(balance);
        }
    };

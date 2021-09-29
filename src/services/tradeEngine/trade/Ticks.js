import { getLast }                    from 'binary-utils';
import * as constants                 from './state/constants';
import { getDirection, getLastDigit } from '../utils/helpers';
import { expectPositiveInteger }      from '../utils/sanitize';
import { translate }                  from '../../../utils/lang/i18n';

let tickListenerKey;

export default Engine =>
    class Ticks extends Engine {
        watchTicks(symbol) {
            if (symbol && this.symbol !== symbol) {
                const { ticksService } = this.$scope;

                ticksService.stopMonitor({
                    symbol,
                    key: tickListenerKey,
                });

                const callback = ticks => {
                    this.checkProposalReady();
                    const lastTick = ticks.slice(-1)[0];
                    const { epoch } = lastTick;
                    this.store.dispatch({ type: constants.NEW_TICK, payload: epoch });
                };

                const key = ticksService.monitor({ symbol, callback });

                this.symbol = symbol;

                tickListenerKey = key;
            }
        }

        getTicks() {
            return new Promise(resolve =>
                this.$scope.ticksService
                    .request({ symbol: this.symbol })
                    .then(ticks => resolve(ticks.map(o => o.quote)))
            );
        }

        getLastTick(raw) {
            return new Promise(resolve =>
                this.$scope.ticksService
                    .request({ symbol: this.symbol })
                    .then(ticks => resolve(raw ? getLast(ticks) : getLast(ticks).quote))
            );
        }

        getLastDigit() {
            return new Promise(resolve =>
                this.getLastTick().then(tick => resolve(getLastDigit(tick, this.getPipSize())))
            );
        }

        getLastDigitList() {
            return new Promise(resolve =>
                this.getTicks().then(ticks => resolve(ticks.map(tick => getLastDigit(tick, this.getPipSize()))))
            );
        }

        checkDirection(dir) {
            return new Promise(resolve =>
                this.$scope.ticksService
                    .request({ symbol: this.symbol })
                    .then(ticks => resolve(getDirection(ticks) === dir))
            );
        }

        getOhlc(args) {
            const { granularity = this.options.candleInterval || 60, field } = args || {};

            return new Promise(resolve =>
                this.$scope.ticksService
                    .request({ symbol: this.symbol, granularity })
                    .then(ohlc => resolve(field ? ohlc.map(o => o[field]) : ohlc))
            );
        }

        getOhlcFromEnd(args) {
            const { index: i = 1 } = args || {};

            const index = expectPositiveInteger(Number(i), translate('Index must be a positive integer'));

            return new Promise(resolve => this.getOhlc(args).then(ohlc => resolve(ohlc.slice(-index)[0])));
        }

        getPipSize() {
            return this.$scope.ticksService.pipSizes[this.symbol];
        }
    };

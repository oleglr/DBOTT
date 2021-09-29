
import { Provider } from 'mobx-react';
import React        from 'react';
import Bot          from './components/bot.jsx';
import RootStore    from './stores';

class App extends React.Component {
    rootStore = new RootStore();

    render() {
        return (
            <Provider {...this.rootStore}>
                <Bot>{this.rootStore.bot.title}</Bot>
            </Provider>
        );
    }
}

export default App;

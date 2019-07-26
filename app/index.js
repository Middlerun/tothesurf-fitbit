import StartView from './StartView';
import RunView from './RunView';
import { Application } from './view';

class App extends Application {
  screens = { StartView, RunView };
}

App.start('StartView');



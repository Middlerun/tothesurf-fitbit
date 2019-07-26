import StartView from './StartView';
import RunView from './RunView';
import FinishView from './FinishView';
import { Application } from './view';

class App extends Application {
  screens = { StartView, RunView, FinishView };
}

App.start('StartView');

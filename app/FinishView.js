import { View, $at } from './view';
import { get } from '../common/sharedState';
import { formatDuration } from '../common/time';

const $ = $at('#screen-finish');

class StartView extends View {
  el = $();
  timeLabel = $('#finish-time');

  onMount() {
    this.render();
  }

  onUnmount() {
  }

  onRender() {
    this.timeLabel.text = formatDuration(get('runTime'));
  }
}

export default StartView;
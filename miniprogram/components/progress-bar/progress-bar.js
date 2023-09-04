let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
// 设置当前播放时间（取整）
let currentSec = 0
// 设置当前播放总时长
// let duration = 0
/**
 * 解决：onTimeUpdate拖动滚动条闪烁问题
 */
let isMoving = false
Component({
  properties: {

  },
  data: {
    showTime: {
      currentTime: "00:00",
      totalTime: "00:00"
    },
    movableDis: 0,
    progress: 0
  },
  // 组件生命周期
  lifetimes: {
    ready() {
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },
  methods: {
    onChange(event) {
      // 拖拽位置
      if (event.detail.source == 'touch') {
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100;
        this.data.movableDis = event.detail.x
      }
      isMoving = true
    },
    onTouchEnd() {
      console.log('onTouchEnd');
      const duration = backgroundAudioManager.duration
      const currentTime = Math.floor(backgroundAudioManager.currentTime)
      const {
        min,
        sec
      } = this._dateFormat(currentTime)
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: `${min}:${sec}`
      })
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    },
    _getMovableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec(react => {
        movableAreaWidth = react[0].width
        movableViewWidth = react[1].width
      })
    },
    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay');
        isMoving = false
      })
      backgroundAudioManager.onStop(() => {
        console.log('onStop');
      })
      backgroundAudioManager.onPause(() => {
        console.log('onPause');
      })
      // 监听进度条挪到一个位置，音乐还没加载到这个位置
      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting');
      })
      // 监听音频可以播放的状态
      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay');
        if (backgroundAudioManager.duration !== undefined) {
          this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })
      // 监听音乐的播放进度（前台播放）
      backgroundAudioManager.onTimeUpdate(() => {
        if (!isMoving) {
          const currentTime = backgroundAudioManager.currentTime
          const duration = backgroundAudioManager.duration
          const secs = currentTime.toString().split('.')[0]
          if (secs != currentSec) {
            const {
              min,
              sec
            } = this._dateFormat(Math.floor(currentTime))
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${min}:${sec}`
            })
            currentSec = secs
          }
        }
      })
      // 监听音乐播放完成后动作
      backgroundAudioManager.onEnded(() => {
        this.triggerEvent('musicEnd')
        console.log('onEnded');
      })
      // 监听音乐播放出现错误
      backgroundAudioManager.onError(() => {
        console.log('onError');
      })
    },
    _setTime() {
      const duration = backgroundAudioManager.duration;
      const {
        min,
        sec
      } = this._dateFormat(Math.floor(duration))
      this.setData({
        ['showTime.totalTime']: `${min}:${sec}`
      })
    },
    // 处理歌曲总时长
    _dateFormat(sec) {
      const min = Math.floor(sec / 60);
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        "sec": this._parse0(sec)
      }
    },
    // 处理总时长格式
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    }
  }
})
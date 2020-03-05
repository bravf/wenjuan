import {
  getUuid,
  getGroupSize,
  arrayRemove,
  getRectInfo,
  getMousePoint,
} from '../core/base'
import * as rectConfig from '../core/rect-config'
export default {
  data () {
    return {
      rects: {},
      currRects: [],
      hoverRects: [],
      tempGroup: null,
      mouse: {
        ing: false,
        startLeft: 0,
        startTop: 0,
        currLeft: 0,
        currTop: 0,
        // eventType 解释
        // move 移动 rect
        // resize 放大 rect
        // rotate 旋转 rect
        // create 新建 rect
        eventType: '',
        resizerDir: '',
        createType: '',
        // 鼠标对象
        e: null,
      },
      setting: {
        prop: '',
        value: '',
      },
      handler: {
        // 用来闪烁
        show: true,
      },
      rectConfig: {
        ...rectConfig,
      },
      clipboard: [],
      zIndex: 0,
      renderHook: 0,
    }
  },
  methods: {
    _create (type = 'rect') {
      let data = this.rectConfig[type]
      if (!data) {
        return
      }
      return this._create2({type, data})
    },
    _create2 (config) {
      let data = config.data
      // 类型是数组，说明要创建一个 group 组件
      // 并且数组第一个是 group 信息
      if (Array.isArray(data)){
        let group = this._createRect('group', data[0].data)
        data.slice(1).map(o => {
          let rect = this._createRect(o.type, o.data)
          // 只简单的处理 children，groupId
          group.children.push(rect.id)
          rect.groupId = group.id
        })
        return group
      }
      else {
        return this._createRect(config.type, data)
      }
    },
    _createRect (type = 'rect', data) {
      data = {...data}
      let rect = {
        id: getUuid().replace(/-/g, ''),
        groupId: '',
        tempGroupId: '',
        children: [],
        data,
        // 临时数据，用来中间态计算
        tempData: null,
        // 类型
        type,
      }
      this.rects[rect.id] = rect
      return rect
    },
    _clone (rect) {
      let f = (rect2) => {
        return {
          type: rect2.type,
          data: {...rect2.data},
        }
      }
      if (this._checkIsGroup(rect)){
        let rects = [f(rect)]
        rect.children.forEach(rectId => {
          rects.push(f(this._getRectById(rectId)))
        })
        return {
          type: 'group',
          data: rects,
        }
      }
      else {
        return f(rect)
      }
    },
    // 绑定父子关系
    _bindGroup (group, rects) {
      this._historyGroup()
      let groupZIndex = group.data.zIndex
      let f = (rect) => {
        this._historyAdd(rect.id, 
          {
            groupId: rect.groupId,
            data: {
              zIndex: rect.data.zIndex,
            }
          },
          {
            groupId: group.id,
            data: {
              zIndex: groupZIndex + 1
            }
          }
        )
        rect.tempGroupId = ''
        rect.groupId = group.id
        group.children.push(rect.id)
        rect.data.zIndex = groupZIndex + 1
      }
      rects.forEach(rect => {
        if (this._checkIsGroup(rect)){
          // 先删除这个 group
          this._removeRectById(rect.id)
          this._historyAdd(rect.id, rect, null)
          // 再执行儿子们
          rect.children.forEach(rectId => {
            f(this._getRectById(rectId))
          })
        }
        else {
          f(rect)
        }
      })
      this._updateGroupSize(group)
      this._historyAdd(group.id, null, group)
      this._historyGroupEnd()
    },
    _unbindGroup (group) {
      this._historyGroup()
      group.children.forEach(id => {
        var rect = this._getRectById(id)
        this._historyAdd(id, {
          groupId: rect.groupId
        }, {
          groupId: '',
        })
        rect.groupId = ''
      })
      this._removeRectById(group.id)
      this._historyAdd(group.id, group, null)
      this._historyGroupEnd()
    },
    _bindTempGroup (rects) {
      if (!this.tempGroup){
        this.tempGroup = this._create('tempGroup')
      }
      let group = this.tempGroup
      rects.forEach(rect => {
        rect.tempGroupId = group.id
        group.children.push(rect.id)
        rect.data.zIndex = group.data.zIndex + 1
      })
      this._updateRectTempData(group)
      this._updateGroupSize(group)
      return group
    },
    _unbindTempGroup () {
      if (!this.tempGroup){
        return
      }
      let group = this.tempGroup
      group.children.forEach(id => {
        var rect = this._getRectById(id)
        rect.tempGroupId = ''
      })
      group.children = []
      delete this.rects[group.id]
      this.tempGroup = null
    },
    _unbindTempGroupSome (children) {
      let group = this.tempGroup
      children.forEach(rect => {
        let id = rect.id
        rect.tempGroupId = ''
        arrayRemove(group.children, id)
      })
      return group
    },
    // 通过 id 从 rects 中找到 object
    _getRectById (id) {
      return this.rects[id]
    },
    _removeRectById (id) {
      delete this.rects[id]
    },
    // 更新 group size
    _updateGroupSize (group) {
      var size = this._getGroupSize(group)
      group.data = {...group.data, ...size}
      return size
    },
    _getGroupSize (group) {
      let rects = group.children.map(id => {
        return this._getRectById(id)
      })
      return getGroupSize(rects, group.data.angle)
    },
    _checkIsGroupLike (rect) {
      return rect.type === 'group' || rect.type === 'tempGroup'
    },
    _checkIsTempGroup (rect) {
      return rect.type === 'tempGroup'
    },
    _checkIsGroup (rect) {
      return rect.type === 'group'
    },
    _updateRectZIndex (rect) {
      let data = rect.data
      let isGroupLike = this._checkIsGroupLike(rect)
      let oldZIndex = data.zIndex
      let newZIndex = data.zIndex  = ++ this.zIndex

      if (isGroupLike){
        let diff = newZIndex - oldZIndex
        let f = (_rect) => {
          _rect.data.zIndex += diff
          this.zIndex = Math.max(this.zIndex, _rect.data.zIndex)
        }
        rect.children.forEach(id => {
          let rect2 = this._getRectById(id)
          f(rect2)

          if (this._checkIsGroup(rect2)){
            rect2.children.forEach(id => {
              let rect3 = this._getRectById(id)
              f(rect3)
            })
          }
        })
      }
    },
    _updateAllRectsTempData () {
      Object.values(this.rects).forEach(rect => {
        rect.tempData = getRectInfo(rect.data)
      })
      if (this.tempGroup){
        this.tempGroup.tempData = getRectInfo(this.tempGroup.data)
      }
    },
    _updateRectTempData (rect) {
      this._getRects(rect).forEach(rect2 => {
        rect2.tempData = getRectInfo(rect2.data)
      })
    },
    _getRects (rect) {
      let isGroupLike = this._checkIsGroupLike(rect)
      if (isGroupLike){
        let rects = [rect]
        rect.children.forEach(rectId => {
          let rect2 = this._getRectById(rectId)
          rects.push(rect2)
          if (rect2.children.length){
            rect2.children.forEach(rectId2 => {
              rects.push(this._getRectById(rectId2))
            })
          }
        })
        return rects
      }
      else {
        return [rect]
      }
    },
    _updateRectData (rect, data) {
      rect.data = {...rect.data, ...data}
      if (rect.groupId){
        this._updateGroupSize(this._getRectById(rect.groupId))
      }
      if (rect.tempGroupId){
        this._updateGroupSize(this._getRectById(rect.tempGroupId))
      }
    },
    _updateGroupState (group, f, isRotate = false) {
      let groupIds = []
      group.children.forEach(id => {
        let rect = this._getRectById(id)

        // 如果是 group 忽略，并且暂存起来，最后一起重置
        if (this._checkIsGroup(rect)){
          rect.children.forEach(id => f(id))
          groupIds.push(id)
        }
        else {
          f(id)
        }
      })
      groupIds.forEach(groupId => {
        // 如果是旋转，那么还是要执行以下
        if (isRotate) {
          f(groupId)
        }
        // 不是旋转就得同步
        else {
          this._updateGroupSize(this._getRectById(groupId))
        }
      })
    },
    _getTempGroup (rect) {
      return this.tempGroup
    },
    _focusRect (rect, e = {}) {
      let isDblclick = e.type === 'dblclick'
      let isShiftkey = e.shiftKey
      let group = this._getRectById(rect.groupId)
      let tempGroup = rect.tempGroupId ? this._getTempGroup() : null
      let currRect = this.currRects[0]
      let mouse = this.mouse
      let mousePoint = getMousePoint(e)
      mouse.e = e

      // 此方法处理 dblclick，shift，group，tempGroup 交杂的情况
      let f = () => {
        if ((rect === currRect)){
          if (isDblclick){
            rect.data.isEdit = true
          }
          return
        }
        // if (currRect  && (group === currRect) ){console.log(1)
        //   return
        // }
        if (isShiftkey && isDblclick){
          return
        }
        if (isDblclick){
          this._blurRect()
          if (group && !group.data.isOpen){
            group.data.isOpen = true
          }
          if (!group || (group && group.isOpen)){
            rect.data.isEdit = true
          }
          this._updateCurrRect(rect)
          return
        }
        if (!isShiftkey){
          if (!group && !tempGroup){
            this._blurRect()
            this._updateCurrRect(rect)
            if (this._checkIsGroup(rect)){
              rect.data.isOpen = false
            }
            return
          }
          if (tempGroup){
            this._updateCurrRect(tempGroup)
            return
          }
          if (group){
            let groupIsOpen = group.data.isOpen
            this._blurRect()
            if (!groupIsOpen){
              this._updateCurrRect(group)
            }
            else {
              this._updateCurrRect(rect)
              group.data.isOpen = true
            }
          }
          return
        }
        if (isShiftkey){
          if (group && !group.data.isOpen){
            rect = group
          }
          if (!currRect){
            this._updateCurrRect(rect)
            return
          }
          if (this._checkIsTempGroup(currRect)){
            if (currRect.children.includes(rect.id)){
              this._unbindTempGroupSome([rect])
              // 如果临时组就剩一个了，那么解散
              if (currRect.children.length === 1){
                let last = currRect.children[0]
                this._blurRect()
                this._updateCurrRect(this._getRectById(last))
              }
              else {
                this._updateGroupSize(currRect)
              }
            }
            else {
              this._bindTempGroup([rect])
            }
          }
          else {
            if (currRect !== rect){
              this._bindTempGroup([currRect, rect])
              this._blurRect(false)
              this._updateCurrRect(this.tempGroup)
            }
          }
        }
      }
      f()
      // 记录鼠标坐标
      mouse.ing = true
      mouse.startLeft = mouse.currLeft = mousePoint.left
      mouse.startTop = mouse.currTop = mousePoint.top
      this._updateRectZIndex(this.currRects[0])
      this._updateAllRectsTempData()
      this._updateGuide()
      this._clearSetting()
    },
    _blurRect (closeGroup = true) {
      let rect = this.currRects[0]
      if (!rect) {
        return
      }
      this.currRects = []
      this._hoverOffRect()
      // 如果是 tempGroup
      if (this._checkIsTempGroup(rect)){
        // 解除关系
        this._unbindTempGroup(rect)
        // 删除
        this._removeRectById(rect.id)
      }
      else {
        rect.data.isEdit = false
      }
      
      if (closeGroup){
        // 如果 rect 父亲，则关闭父亲
        let group = this._getRectById(rect.groupId)
        if (group){
          group.data.isOpen = false
        }
      }
    },
    _hoverRect (rect) {
      if (this.mouse.ing){
        return
      }
      let target = rect
      let rectType = rect.type
      let group = this._getRectById(rect.groupId)
      if (group && !group.data.isOpen){
        target = group
      }
      if ( (rectType === 'group') && rect.data.isOpen){
        target = null
      }
      this.hoverRects = target ? [target] : []
    },
    _hoverOffRect () {
      this.hoverRects = []
    },
    _getRectBaseJsxProps (rect) {
      let data = rect.data
      return {
        style_left: data.left + 'px',
        style_top: data.top + 'px',
        style_width: data.width + 'px',
        style_height: data.height + 'px',
        'style_z-index': data.zIndex,
        style_transform: `rotate(${data.angle}deg)`,
      }
    },
    _updateCurrRect (rect) {
      this.currRects = rect ? [rect] : []
    },
    _clearSetting () {
      this.setting.prop = ''
      this.setting.value = ''
    },
    _walkRect (rect, f) {
      let f2 = (rect2) => {
        rect2.children.forEach(rectId3 => f2(
          this._getRectById(rectId3)
          )
        )
        f(rect2)
      }
      f2(rect)
      if (rect.groupId) {
        f(this._getRectById(rect.groupId))
      }
    },
    _flashHandler () {
      this.handler.show = false
      setTimeout(() => {
        this.handler.show = true
      }, 1000)
    }
  }
}
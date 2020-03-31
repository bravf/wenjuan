import {
  getUuid,
  getGroupSize,
  getRectInfo,
  middleLeft,
  middleTop,
  tNumber,
  checkRectOverlap2,
} from '@/core/base'
import * as rectConfig from '@/core/rect-config'
export default {
  data () {
    return {
      objects: {},
      currProjectId: '',
      currPageId: '',
      currRectId: '',
      hoverRectId: '',
      tempGroupId: '',
      selectedRects: {},
      mouse: {
        ing: false,
        startLeft: 0,
        startTop: 0,
        currLeft: 0,
        currTop: 0,
        // eventType 解释
        // move: 移动 rect
        // resize: 放大 rect
        // rotate: 旋转 rect
        // create: 新建 rect
        // cirlce: 圈选组件
        // movePage: 页面列表移动排序
        eventType: '',
        resizerDir: '',
        createType: '',
        // 鼠标对象
        e: {},
      },
      contextmenu: {
        // rect, page
        eventType: '',
        e: {},
        show: false,
      },
      setting: {
        prop: '',
        value: '',
      },
      handler: {
        // 用来闪烁
        show: true,
        timer: null,
      },
      rectConfig: {
        ...rectConfig,
      },
      clipboard: {
        count: 0,
        data: [],
      },
      zIndex: 0,
      renderHook: 0,
      scale: 1,
      delayTimer: null,
    }
  },
  methods: {
    _parseLongProp (
      prop, 
      data = this.$data
    ) {
      let props = prop.split('.')
      let object = data
      let lastProp = props.slice(-1)[0]
      props.slice(0, -1).forEach(p => {
        object = object[p]
      })
      return {
        get () {
          return object[lastProp]
        },
        set (value) {
          let isNull = (value === null) || (value === undefined) 
          if (isNull){
            delete object[lastProp]
          }
          else {
            object[lastProp] = value
          }
        }
      }
    },
    _createProject () {
      let project = {
        id: getUuid(),
        name: '项目',
        type: 'project',
        count: 1,
        pages: {
          headId: '',
          tailId: '',
        },
        isDelete: false,
      }
      this._commandProjectAdd(project)
      return project
    },
    _createPage (parentId = this.currProjectId) {
      let page = {
        id: getUuid(),
        name: '页面' + this.objects[this.currProjectId].count ++,
        type: 'page',
        count: 1,
        parentId,
        projectId: this.currProjectId,
        pages: {
          headId: '',
          tailId: '',
        },
        // 记录 rects
        rects: {
          headId: '',
          tailId: '',
        },
        data: {
          isNameEdit: false,
          isExpand: true,
        },
        isDelete: false,
      }
      this._commandPageAdd(page)
      this._linkedListAppend(this.objects[parentId], page, 'pages')
      return page
    },
    _removePage () {
      let currPage = this.objects[this.currPageId]
      let f = (page) => {
        this._commandObjectDelete(page.id)
      }
      this._linkedListRemove(this.objects[currPage.parentId], currPage, 'pages')
      this._linkedListWalk(currPage, 'pages', f)
      f(currPage)
      
      let currPageId = this.objects[this.currProjectId].pages.headId
      this._updateCurrPage(this.objects[currPageId])
    },
    _createRect (type = 'rect') {
      let data = this.rectConfig[type]
      if (!data) {
        return
      }
      type = 'rect-' + type
      return this._createRectByConfig({type, data})
    },
    _createRectByConfig (config) {
      let data = config.data
      // 类型是数组，说明要创建一个 group 组件
      // 并且数组第一个是 group 信息
      if (Array.isArray(data)){
        let group = this._createRectBase(data[0].type, data[0].data)
        let rects = data.slice(1).map(o => this._createRectBase(o.type, o.data))
        this._bindGroup(group, rects)
        return group
      }
      else {
        return this._createRectBase(config.type, data)
      }
    },
    _createRectBase (
      type = 'rect', 
      data
    ) {
      data = {...data}
      let index = this.objects[this.currPageId].count ++
      let rect = {
        id: getUuid(),
        parentId: this.currPageId,
        pageId: this.currPageId,
        groupId: '',
        tempGroupId: '',
        data,
        // 临时数据，用来中间态计算
        tempData: null,
        // 类型
        type,
        name: data.name + index,
        prevId: '',
        nextId: '',
        tempIndex: index,
        isDelete: false,
      }
      if (this._checkIsGroup(rect)){
        rect = {
          ...rect,
          rects: {
            headId: '',
            tailId: '',
          },
        }
      }
      this._commandRectAdd(rect)
      if (!this._checkIsTempGroup(rect)){
        this._linkedListAppend(this.objects[this.currPageId], rect)
      }
      return rect
    },
    _safeObject (rect) {
      if (!rect) {
        return rect
      }
      if (typeof rect === 'string') {
        rect = this.objects[rect]
      }
      return rect
    },
    _cloneRectDeep (rect) {
      rect = this._safeObject(rect)
      let f = (rect2) => {
        return {
          type: rect2.type,
          data: {...rect2.data},
        }
      }
      if (this._checkIsGroup(rect)){
        let rects = [f(rect)]
        this._getRectsByGroup(rect).forEach(rect2 => {
          rects.push(f(rect2))
        })
        return {
          type: 'rect-group',
          data: rects,
        }
      }
      else {
        return f(rect)
      }
    },
    _getObjectsByParentId (
      groupId, 
      prop = 'groupId'
    ) {
      let objects = []
      for (let key in this.objects){
        let object = this.objects[key]
        if (!object.isDelete && (object[prop] === groupId) ){
          objects.push(object)
        }
      }
      return objects
    },
    // 获得当前 page 下的所有 rects
    _getRectsByPageDeep (pageId = this.currPageId) {
      let rects = this._linkedListGetObjects(this.objects[pageId])
      if (this.tempGroupId){
        rects.push(this.objects[this.tempGroupId])
      }
      return rects
    },
    _getRectsByGroup (group) {
      group = this._safeObject(group)
      let rects = []
      if (this._checkIsTempGroup(group)){
        rects = this._getObjectsByParentId(group.id, 'tempGroupId')
      }
      else if (this._checkIsGroup(group)){
        rects = this._getObjectsByParentId(group.id)
      }
      else {
        rects = [group]
      }
      return rects
    },
    _getGroupByRect (rect) {
      rect = this._safeObject(rect)
      let group = this.objects[rect.groupId]
      return (group && !group.isDelete) ? group : null
    },
    _getTempGroupByRect (rect) {
      rect = this._safeObject(rect)
      if (rect.tempGroupId){
        return this.objects[rect.tempGroupId]
      }
      let group = this._getGroupByRect(rect)
      if (group && group.tempGroupId){
        return this.objects[group.tempGroupId]
      }
      return null
    },
    // 绑定父子关系
    _bindGroup (
      group, 
      rects
    ) {
      group = this._safeObject(group)
      // 先求出 rects 中索引最大的，把 group 插入到后面
      let sortRects = new Set()
      // 记录一下 groups
      let groups = new Set()
      rects.forEach(rect => {
        rect = this._safeObject(rect)
        if (this._checkIsTempGroup(rect)){
          return
        }
        if (this._checkIsGroup(rect)){
          sortRects.add(rect)
          return
        }
        if (rect.groupId){
          let _group = this.objects[rect.groupId]
          groups.add(_group)
          sortRects.add(_group)
          return
        }
        sortRects.add(rect)
      })
      let topRect = Array.from(sortRects).sort(
        (a, b) => b.tempIndex - a.tempIndex
      )[0]
      let currPage = this.objects[this.currPageId]
      this._linkedListRemove(currPage, group)
      this._linkedListInsertAfter(currPage, topRect, group)

      // 处理 rects 和 group 的关系
      rects.sort(
        (a, b) => a.tempIndex - b.tempIndex
      ).forEach(rect => {
        rect = this._safeObject(rect)
        if (this._checkIsTempGroup(rect)){
          return
        }
        if (this._checkIsGroup(rect)){
          this._removeRectById(rect.id)
          return
        }
        if (rect.groupId){
          if (this._getGroupByRect(rect)){
            this._linkedListRemove(this.objects[rect.groupId], rect)
          }
        }
        else  {
          this._linkedListRemove(currPage, rect)
        }
        this._linkedListAppend(group, rect)
        this._commandRectPropUpdate(rect, 'tempGroupId', '')
        this._commandRectPropUpdate(rect, 'groupId', group.id)
        this._commandRectPropUpdate(rect, 'parentId', group.id)
      })
      // 处理一下 groups 的情况
      Array.from(groups).forEach(group => {
        if (!(group.id in this.objects) || this.objects[group.id].isDelete){
          return
        }
        let children = this._getRectsByGroup(group)
        if (children.length <= 1){
          this._unbindGroup(group)
        }
        else {
          this._commandRectDataPropUpdate(group, 'isOpen', false)
          this._updateGroupSize(group)
        }
      })
      this._updateGroupSize(group)
    },
    _unbindGroup (group) {
      group = this._safeObject(group)
      this._getRectsByGroup(group).forEach(rect => {
        this._commandRectPropUpdate(rect, 'groupId', '')
        this._commandRectPropUpdate(rect, 'parentId', '')
        this._linkedListRemove(group, rect)
        this._linkedListInsertBefore(this.objects[this.currPageId], group, rect)
      })
      this._removeRectById(group.id)
    },
    _bindTempGroup (rects) {
      if (!this.tempGroupId){
        this._commandPropUpdate('tempGroupId', this._createRect('tempGroup').id)
      }
      let group = this.objects[this.tempGroupId]
      rects.forEach(rect => {
        rect = this._safeObject(rect)
        this._commandRectPropUpdate(rect, 'tempGroupId', group.id)
      })
      this._updateRectTempData(group)
      this._updateGroupSize(group)
      return group
    },
    _unbindTempGroup () {
      if (!this.tempGroupId){
        return
      }
      this._getRectsByGroup(this.tempGroupId).forEach(rect => {
        this._commandRectPropUpdate(rect, 'tempGroupId', '')
      })
      this._commandRectDelete(this.tempGroupId)
      this._commandPropUpdate('tempGroupId', '')
    },
    _unbindTempGroupSome (rects) {
      if (!this.tempGroupId){
        return
      }
      rects.forEach(rect => {
        this._commandRectPropUpdate(rect, 'tempGroupId', '')
      })
      let children = this._getRectsByGroup(this.currRectId)
      if (children.length <= 1) {
        this._unbindTempGroup()
      }
      // 否则重置 group  size
      else {
        this._updateGroupSize(this.currRectId)
      }
    },
    // 通过 id 从 rects 中找到 object
    _getRectById (id) {
      return this.objects[id]
    },
    _getTempGroup () {
      return this.objects[this.tempGroupId]
    },
    _removeRectById (id) {
      let rect = this.objects[id]
      let group = this._getGroupByRect(id)
      if (!this._checkIsTempGroup(rect)){
        if (rect.groupId){
          if (group){
            this._linkedListRemove(group, this.objects[id])
          }
        }
        else {
          this._linkedListRemove(this.objects[this.currPageId], this.objects[id])
        }
      }
      this._commandRectDelete(id)
      if (group){
        let children = this._getRectsByGroup(group)
        if (children.length === 1){
          this._unbindGroup(group)
        }
        else {
          this._updateGroupSize(group)
        }
      }
    },
    // 更新 group size
    _updateGroupSize (group) {
      group = this._safeObject(group)
      var size = this._getGroupSize(group)
      this._updateRectData(group, size, false)
      return size
    },
    _getGroupSize (group) {
      group = this._safeObject(group)
      let rects = this._getRectsByGroup(group)
      return getGroupSize(rects, group.data.angle)
    },
    _checkIsPage (object) {
      return object.type === 'page'
    },
    _checkIsRectLike (rect) {
      return rect.type.indexOf('rect-') === 0
    },
    _checkIsGroupLike (rect) {
      return rect.type === 'rect-group' || rect.type === 'rect-tempGroup'
    },
    _checkIsTempGroup (rect) {
      return rect.type === 'rect-tempGroup'
    },
    _checkIsGroup (rect) {
      return rect.type === 'rect-group'
    },
    _updateAllRectsTempData () {
      this._getRectsByPageDeep().forEach(rect => {
        rect.tempData = getRectInfo(rect.data)
      })
    },
    _updateRectTempData (rect) {
      rect = this._safeObject(rect)
      this._getRectsByRectDeep(rect).forEach(rect2 => {
        rect2.tempData = getRectInfo(rect2.data)
      })
    },
    _getRectsByRectDeep (rect) {
      if (!this._checkIsGroupLike(rect)){
        return [rect]
      }
      if (this._checkIsGroup(rect)){
        return [rect, ...this._getRectsByGroup(rect)]
      }
      if (this._checkIsTempGroup(rect)){
        let rects = [rect]
        this._getRectsByGroup(rect).forEach(rect2 => {
          rects = [...rects, rect2]
          if (this._checkIsGroup(rect2)){
            rects = [...rects,...this._getRectsByGroup(rect2)]
          }
        })
        return rects
      }
    },
    _updateRectData (
      rect, 
      data, 
      isSyncParent = true
    ) {
      // 如果是 line，那么更新 height 时候同步更新 borderWidth
      // 并且最小值为 1
      let isLine = rect.type === 'rect-line'
      if (isLine && ('height' in data)){
        let height = Math.max(data.height, 1)
        data['borderWidth'] = data['height'] = height
      }
      for (let k in data){
        let v = data[k]
        if (typeof v === 'number'){
          v = tNumber(v)
        }
        this._commandRectDataPropUpdate(rect, k, v)
      }

      if (isSyncParent){
        let group = this._getGroupByRect(rect)
        if (group){
          this._updateGroupSize(group)
        }
        let tempGroup = this._getTempGroupByRect(rect)
        if (tempGroup){
          this._updateGroupSize(tempGroup)
        }
      }
    },
    _updateGroupState (
      group, 
      f, 
      isRotate = false
    ) {
      let groupIds = []
      this._getRectsByRectDeep(group).forEach(rect => {
        let id = rect.id
        if (this._checkIsGroup(rect)){
          groupIds.push(id)
        }
        else {
          // 如果有 group，也加入
          if (rect.groupId){
            groupIds.push(rect.groupId)
          }
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
    _addSelectedRect (rect) {
      if (this._checkIsTempGroup(rect)) {
        return
      }
      let prop = 'selectedRects.' + rect.id
      this._commandPropUpdate(prop, 1)
    },
    _removeSelectedRect (rect) {
      let prop = 'selectedRects.' + rect.id
      this._commandPropUpdate(prop, null)
      this._unbindTempGroupSome([rect])
    },
    _clearSelectedRects () {
      this._commandPropUpdate('selectedRects', {})
      this._unbindTempGroup()
    },
    _updateCurrRectBySelected () {
      let unLockRects = this._getUnLockRectsBySelected()
      let count = unLockRects.length
      if (count <= 1) {
        this._unbindTempGroup()
        this._updateCurrRect(this.objects[unLockRects[0]])
      }
      else {
        let tempGroup = this._bindTempGroup(unLockRects)
        this._updateCurrRect(tempGroup)
      }
      this._updateAllRectsTempData()
      this._updateGuide()
      this._clearSetting()
      this.mouse.e = {}
      this.renderHook ++
    },
    _getLockRectsBySelected () {
      return Object.keys(this.selectedRects).filter(
        rectId => this.objects[rectId].data.isLock
      )
    },
    _getUnLockRectsBySelected () {
      return Object.keys(this.selectedRects).filter(
        rectId => !this.objects[rectId].data.isLock
      )
    },
    _getSelectedRects () {
      return Object.keys(this.selectedRects)
    },
    _focusRect (
      rect, 
      e = {shiftKey: true}, 
      isRest = true
    ) {
      let isDblclick = e.type === 'dblclick'
      let isShiftkey = e.shiftKey
      let group = this._getGroupByRect(rect)
      let tempGroup = this._getTempGroupByRect(rect)
      let currRect = this.objects[this.currRectId]
      let mouse = this.mouse
      mouse.e = e
      // 此方法处理 dblclick，shift，group，tempGroup 交杂的情况
      let f = () => {
        if ((rect === currRect) && !isShiftkey){
          if (isDblclick){
            this._commandRectDataPropUpdate(rect, 'isEdit', true)
          }
          return
        }
        if (isShiftkey && isDblclick){
          return
        }
        if (isDblclick){
          this._blurRect()
          let isGroupOpen = group.data.isOpen
          if (group && !isGroupOpen){
            this._commandRectDataPropUpdate(group, 'isOpen', true)
          }
          if (!group || (group && isGroupOpen)){
            this._commandRectDataPropUpdate(rect, 'isEdit', true)
          }
          this._addSelectedRect(rect)
          return
        }
        if (!isShiftkey){
          if (!group && !tempGroup){
            this._blurRect()
            this._addSelectedRect(rect)
            if (this._checkIsGroup(rect)){
              this._commandRectDataPropUpdate(rect, 'isOpen', false)
            }
            return
          }
          if (tempGroup){
            this._addSelectedRect(tempGroup)
            return
          }
          if (group){
            let groupIsOpen = group.data.isOpen
            this._blurRect()
            if (!groupIsOpen){
              this._addSelectedRect(group)
            }
            else {
              this._addSelectedRect(rect)
              this._commandRectDataPropUpdate(group, 'isOpen', true)
            }
          }
          return
        }
        if (isShiftkey){
          if (this._checkIsGroup(rect) && rect.data.isOpen){
            return
          }
          if (group && !group.data.isOpen){
            rect = group
          }
          if (rect.id in this.selectedRects){
            this._removeSelectedRect(rect)
          }
          else  {
            this._addSelectedRect(rect)
          }
        }
      }
      f()
      if (isRest) {
        this._updateCurrRectBySelected()
      }
    },
    _blurRect (closeGroup = true) {
      this._commandPropUpdate('selectedRects', {})
      this._hoverOffRect()
      let rect = this.objects[this.currRectId]
      if (!rect) {
        return
      }
      this._commandPropUpdate('currRectId', '')
      if (this._checkIsTempGroup(rect)){
        this._unbindTempGroup(rect)
      }
      else {
        this._commandRectDataPropUpdate(rect, 'isEdit', false)
      }
      if (closeGroup){
        // 如果 rect 父亲，则关闭父亲
        let group = this._getGroupByRect(rect)
        if (group){
          this._commandRectDataPropUpdate(group, 'isOpen', false)
        }
      }
    },
    _hoverRect (rect) {
      rect = this._safeObject(rect)
      if (this.mouse.ing){
        return
      }
      let target = rect
      let group = this._getGroupByRect(rect)
      if (group && !group.data.isOpen){
        target = group
      }
      if (this._checkIsGroup(rect) && rect.data.isOpen){
        target = null
      }
      this._commandPropUpdate('hoverRectId', target ? target.id : '')
    },
    _hoverOffRect () {
      this._commandPropUpdate('hoverRectId', '')
    },
    _getMousePoint (e) {
      let $middle = document.querySelector('.proto-middle')
      return {
        left: e.clientX + $middle.scrollLeft - middleLeft,
        top: e.clientY + $middle.scrollTop - middleTop,
      }
    },
    _getRectBaseJsxProps (
      rect, 
      scale = 1
    ) {
      rect = this._safeObject(rect)
      let data = rect.data
      return {
        style_left: tNumber(data.left * scale, 0) + 'px',
        style_top: tNumber(data.top * scale, 0) + 'px',
        style_width: tNumber(data.width * scale, 0) + 'px',
        style_height: tNumber(data.height * scale, 0) + 'px',
        'style_z-index': data.zIndex,
        style_transform: `rotate(${data.angle}deg)`,
      }
    },
    _updateCurrPage (page) {
      page = this._safeObject(page)
      this._commandPropUpdate('currPageId', page.id)
      this._updateCurrRect()
    },
    _updateCurrRect (rect) {
      rect = this._safeObject(rect)
      this._commandPropUpdate('currRectId', rect ? rect.id : '')
    },
    _updateHoverRect (rect) {
      rect = this._safeObject(rect)
      this._commandPropUpdate('hoverRectId', rect ? rect.id : '')
    },
    _clearSetting () {
      this._commandPropUpdate('setting.prop', '')
      this._commandPropUpdate('setting.value', '')
    },
    _flashHandler () {
      this._commandPropUpdate('handler.show', false)
      clearTimeout(this.handler.timer)
      this.handler.timer = setTimeout(() => {
        this._commandPropUpdate('handler.show', true)
      }, 1000)
    },
    _getCircleSize () {
      let mouse = this.mouse
      let left = Math.min(mouse.startLeft, mouse.currLeft) 
      let top = Math.min(mouse.startTop, mouse.currTop) 
      let width = Math.abs(mouse.currLeft - mouse.startLeft)
      let height = Math.abs(mouse.currTop - mouse.startTop)
      return {
        left,
        top, 
        width,
        height,
        right: left + width,
        bottom: top + height,
        angle: 0,
      }
    },
    _walkCurrPageRects (
      f, 
      isDeep = false
    ) {
      this._linkedListWalk(this.objects[this.currPageId], 'rects', f, isDeep)
    },
    _focusRectWhenCircle () {
      let circle = this._getCircleSize()
      circle = getRectInfo({
        ...circle,
        angle: 0,
      })
      this._walkCurrPageRects((rect => {
        if (checkRectOverlap2(getRectInfo(rect.data, this.scale), circle)) {
          this._focusRect(rect, {shiftKey: true}, false)
        }
      }))
      this._updateCurrRectBySelected()
    },
    _showContextmenu (
      e, 
      type
    ) {
      let contextmenu = this.contextmenu
      contextmenu.e = e
      contextmenu.eventType = type
      contextmenu.show = true
    },
    _delay (f) {
      if (this._delayTimer) {
        clearTimeout(this._delayTimer)
      }
      this._delayTimer = setTimeout(f)
    },
  }
}
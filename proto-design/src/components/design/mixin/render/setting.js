import jsx from 'vue-jsx'
import { tNumber } from '@/core/base'
let {
  div, 
  span,
  input,
  select,
  option,
  label,
  i,
} = jsx
let SpColor = jsx.bind('sp-color')
let _renderSetting = function () {
  let me = this
  let jsxProps = {
    'class_proto-setting': true,
  }
  let rect = this._safeObject(
    this.currRectId || this._getSelectedRects()[0]
  )
  let children = []
  let setting = this.setting

  if (rect){
    let rectData = rect.data
    let isGroupLike = this._checkIsGroupLike(rect)
    let isLine = rect.type === 'rect-line'
    let isText = rect.type === 'rect-text'
    let isAutoSize = rectData.isAutoSize
    let isSameRatio = rectData.isSameRatio
    let isLock = rectData.isLock
    let getInputJsxProps = (prop) => {
      let value = (prop === setting.prop) ? setting.value : rectData[prop]
      if (typeof value === 'number'){
        value = tNumber(value, 0)
      }
      let jsxProps = {
        'class_form-input': true,
        'class_input-sm': true,
        domProps_value: value,
        domProps_type: 'number',
        props_value: value,
        domProps_disabled: isLock,
        props_disabled: isLock,
        key: prop,
        'on_focus' () {
          me._updateRectTempData(rect)
          me._commandPropUpdate('setting.prop', prop)
          me._commandPropUpdate('setting.value', rectData[prop])
        },
        'on_change' (e) {
          let value = e.target.value
          me._commandRectDataPropUpdate(rect, prop, value)
          me._historyPush()
          if (['borderStyle'].includes(prop)){
            me._flashHandler()
          }
        },
      }
      if (['borderColor', 'color', 'backgroundColor'].includes(prop)){
        jsxProps = {
          ...jsxProps,
          'on_change' (value) {
            let color = value.hex8
            me._commandRectDataPropUpdate(rect, prop, color)
            me._historyPush()
            if (['borderColor'].includes(prop)){
              me._flashHandler()
            }
          }
        }
      }
      return jsxProps
    }
    let $left = div({'class_proto-setting-box-item': true},
      span('X轴坐标'),
      input({
        ...getInputJsxProps('left'),
        'on_change' (e) {
          let value = e.target.value
          let intValue = parseInt(value)
          me._moveLeftTo(rect, intValue)
          me._commandPropUpdate('setting.value', intValue)
        },
      })
    )
    children = [...children, $left]
    let $top = div({'class_proto-setting-box-item': true},
      span('Y轴坐标'),
      input({
        ...getInputJsxProps('top'),
        'on_change' (e) {
          let value = e.target.value
          let intValue = parseInt(value)
          me._moveTopTo(rect, intValue)
          me._commandPropUpdate('setting.value', intValue)
        },
      })
    )
    children = [...children, $top]
    let $width = div({'class_proto-setting-box-item': true},
      span('宽度'),
      input({
        domProps_disabled: isAutoSize,
        ...getInputJsxProps('width'),
        'on_change' (e) {
          let value = e.target.value
          let intValue = Math.max(10, parseInt(value))
          me._resizeWidthTo(rect, intValue)
          me._commandPropUpdate('setting.value', intValue)
          me._historyPush()
        },
      })
    )
    children = [...children, $width]
    let $height = div({'class_proto-setting-box-item': true},
      span('高度'),
      input({
        domProps_disabled: isAutoSize || isLine || isSameRatio,
        ...getInputJsxProps('height'),
        'on_change' (e) {
          let value = e.target.value
          let intValue = Math.max(10, parseInt(value))
          me._resizeHeightTo(rect, intValue)
          me._commandPropUpdate('setting.value', intValue)
          me._historyPush()
        },
      })
    )
    children = [...children, $height]
    let $angle = div({'class_proto-setting-box-item': true},
      span('角度'),
      input({
        ...getInputJsxProps('angle'),
        'on_change' (e) {
          let value = e.target.value
          let intValue = parseInt(value) % 360
          if (intValue < 0){
            intValue += 360
          }
          me._rotateTo(rect, intValue)
          me._commandPropUpdate('setting.value', intValue)
        },
      })
    )
    children = [...children, $angle]

    if (!isLine){
      let $isSameRatio = div({'class_proto-setting-box-item': true},
        span('等比缩放'),
        label({
          'class_form-switch': true,
        },
          input({
            ...getInputJsxProps(),
            key: 'isSameRatio',
            domProps_type: 'checkbox',
            domProps_checked: rectData['isSameRatio'],
            'on_change' () {
              let value = !rectData['isSameRatio']
              me._commandRectDataPropUpdate(rect, 'isSameRatio', value)
              me._historyPush()
            }
          }),
          i({'class_form-icon': true,}),
        ),
      )
      children = [...children, $isSameRatio]
    }

    if (isLine){
      let $isAngleLock = div({'class_proto-setting-box-item': true},
        span('锁定角度'),
        label({
          'class_form-switch': true,
        },
          input({
            ...getInputJsxProps(),
            key: 'isAngleLock',
            domProps_type: 'checkbox',
            domProps_checked: rectData['isAngleLock'],
            'on_change' () {
              let value = !rectData['isAngleLock']
              me._commandRectDataPropUpdate(rect, 'isAngleLock', value)
              me._historyPush()
            }
          }),
          i({'class_form-icon': true,}),
        ),
      )
      children = [...children, $isAngleLock]
    }
    if (!isGroupLike){
      if (!isText){
        let $borderWidth = div({'class_proto-setting-box-item': true},
          span('边框宽度'),
          input({
            ...getInputJsxProps('borderWidth'),
            'on_change' (e) {
              let value = e.target.value
              let intValue = Math.max(0, parseInt(value))
              me._commandPropUpdate('setting.value', intValue)
              me._commandRectDataPropUpdate(rect, 'borderWidth', intValue)
              if (isLine){
                me._commandRectDataPropUpdate(rect, 'height', intValue)
              }
            }
          })
        )
        children = [...children, $borderWidth]
        let $borderStyle = div({'class_proto-setting-box-item': true},
          span('边框样式'),
          select({
            ...getInputJsxProps('borderStyle'),
            'class_form-select': true,
            'class_select-sm': true,
          },
            option({props_value: 'solid'},'solid'),
            option({props_value: 'dashed'},'dashed'),
            option({props_value: 'dotted'},'dotted'),
          )
        )
        children = [...children, $borderStyle]
        let $borderColor = div({'class_proto-setting-box-item': true},
          span('边框颜色'),
          SpColor({
            ...getInputJsxProps('borderColor'),
          })
        )
        children = [...children, $borderColor]
      }
      if (!isLine){
        let $backgroundColor = div({'class_proto-setting-box-item': true},
          span('背景颜色'),
          SpColor({
            ...getInputJsxProps('backgroundColor'),
          })
        )
        children = [...children, $backgroundColor]
      }
      if (!isLine){
        let $color = div({'class_proto-setting-box-item': true},
          span('文本颜色'),
          SpColor({
            ...getInputJsxProps('color'),
          })
        )
        children = [...children, $color]
      }
      if (isText){
        let $isAutoSize = div({'class_proto-setting-box-item': true},
          span('自适应尺寸'),
          label({
            'class_form-switch': true,
          },
            input({
              ...getInputJsxProps(),
              key: 'isAutoSize',
              domProps_checked: rectData['isAutoSize'],
              domProps_type: 'checkbox',
              'on_change' () {
                let value = !rectData['isAutoSize']
                me._updateRectTempData(rect)
                me._commandRectDataPropUpdate(rect, 'isAutoSize', value)
                me._resizeText(rect)
                me._historyPush()
              }
            }),
            i({'class_form-icon': true,}),
          )
        )
        children = [...children, $isAutoSize]
      }
      let $fontSize = div({'class_proto-setting-box-item': true},
        span('文本大小'),
        input({
          ...getInputJsxProps('fontSize'),
          'on_change' (e) {
            let value = e.target.value
            let intValue = Math.max(12, parseInt(value))
            me._commandRectDataPropUpdate(rect, 'fontSize', intValue)
            me._commandPropUpdate('setting.value', intValue)
            if (rectData.isAutoSize) {
              me._resizeText(rect)
            }
          },
        })
      )
      children = [...children, $fontSize]
    }
  }
  return div({
    'class_card': true,
    ...jsxProps,
  },
    div('.card-header',
      div('.card-title h6', '样式'),
    ),
    div('.card-body',
      ...children,
    )
  )
}
export {
  _renderSetting,
}
import jsx from 'vue-jsx'
import iview from '../../core/iview'
let  {
  iInput, 
  ColorPicker,
  iSelect,
  iOption,
  checkbox,
} = iview
let {
  div, 
  span, 
} = jsx
let _renderSetting = function (h) {
  let me = this
  let jsxProps = {
    'class_proto-setting': true,
  }
  let rect = this.currRects[0]
  let children = []
  let setting = this.setting

  if (rect){
    let isGroupLike = this._checkIsGroupLike(rect)
    let isLine = rect.type === 'line'
    let isText = rect.type === 'text'
    let isAutoSize = rect.data.isAutoSize
    let data = rect.data
    let getInputJsxProps = (prop) => {
      return {
        props_value: (prop === setting.prop) ? setting.value : data[prop],
        props_type: 'number',
        'on_on-focus' (e) {
          me._updateRectTempData(rect)
          setting.prop = prop
          setting.value = data[prop]
        },
        'on_on-blur' () {
          me._historyAddDataPropChange(rect, [prop])
        },
        'on_on-change' (value) {
          me._updateRectTempData(rect)
          data[prop] = value
          me._historyAddDataPropChange(rect, [prop])
        }
      }
    }
    let $left = div({'class_proto-setting-box-item': true},
      span('left'),
      iInput({
        ...getInputJsxProps('left'),
        'on_on-change' (e) {
          let value = e.target.value
          let intValue = parseInt(value)
          me._moveLeftTo(rect, intValue)
          setting.value = intValue
        },
        'on_on-blur' () {
          me._historyAddDataSizeChange(rect)
        },
      })
    )
    children = [...children, $left]
    let $top = div({'class_proto-setting-box-item': true},
      span('top'),
      iInput({
        ...getInputJsxProps('top'),
        'on_on-change' (e) {
          let value = e.target.value
          let intValue = parseInt(value)
          me._moveTopTo(rect, intValue)
          setting.value = intValue
        },
        'on_on-blur' () {
          me._historyAddDataSizeChange(rect)
        },
      })
    )
    children = [...children, $top]
    let $width = div({'class_proto-setting-box-item': true},
      span('width'),
      iInput({
        ...getInputJsxProps('width'),
        props_disabled: isAutoSize,
        'on_on-change' (e) {
          let value = e.target.value
          let intValue = Math.max(10, parseInt(value))
          me._resizeWidthTo(rect, intValue)
          setting.value = intValue
        },
        'on_on-blur' () {
          me._historyAddDataSizeChange(rect)
        },
      })
    )
    children = [...children, $width]
    let $height = div({'class_proto-setting-box-item': true},
      span('height'),
      iInput({
        ...getInputJsxProps('height'),
        props_disabled: isAutoSize || isLine,
        'on_on-change' (e) {
          let value = e.target.value
          let intValue = Math.max(10, parseInt(value))
          me._resizeHeightTo(rect, intValue)
          setting.value = intValue
        },
        'on_on-blur' () {
          me._historyAddDataSizeChange(rect)
        },
      })
    )
    children = [...children, $height]
    let $angle = div({'class_proto-setting-box-item': true},
      span('angle'),
      iInput({
        ...getInputJsxProps('angle'),
        'on_on-change' (e) {
          let value = e.target.value
          let intValue = parseInt(value) % 360
          if (intValue < 0){
            intValue += 360
          }
          me._rotateTo(rect, intValue)
          setting.value = intValue
        },
        'on_on-blur' () {
          me._historyAddDataSizeChange(rect)
        },
      })
    )
    children = [...children, $angle]
    if (isLine){
      let $isAngleLock = div({'class_proto-setting-box-item': true},
        span('isAngleLock'),
        checkbox({
          ...getInputJsxProps('isAngleLock'),
        })
      )
      children = [...children, $isAngleLock]
    }
    if (!isGroupLike){
      if (!isText){
        let $borderWidth = div({'class_proto-setting-box-item': true},
          span('borderWidth'),
          iInput({
            ...getInputJsxProps('borderWidth'),
            'on_on-change' (e) {
              let value = e.target.value
              let intValue = Math.max(1, parseInt(value))
              setting.value = data['borderWidth'] = intValue
              if (isLine){
                data['height'] = intValue
                me._historyAddDataSizeChange(rect)
              }
            }
          })
        )
        children = [...children, $borderWidth]
        let $borderStyle = div({'class_proto-setting-box-item': true},
          span('borderStyle'),
          iSelect({
            ...getInputJsxProps('borderStyle'),
          },
            iOption({props_value: 'solid'},'solid'),
            iOption({props_value: 'dashed'},'dashed'),
            iOption({props_value: 'dotted'},'dotted'),
          )
        )
        children = [...children, $borderStyle]
        let $borderColor = div({'class_proto-setting-box-item': true},
          span('borderColor'),
          ColorPicker({
            ...getInputJsxProps('borderColor'),
          })
        )
        children = [...children, $borderColor]
      }
      let $backgroundColor = div({'class_proto-setting-box-item': true},
        span('bgColor'),
        ColorPicker({
          ...getInputJsxProps('backgroundColor'),
        })
      )
      children = [...children, $backgroundColor]
      if (!isLine){
        let $color = div({'class_proto-setting-box-item': true},
          span('color'),
          ColorPicker({
            ...getInputJsxProps('color'),
          })
        )
        children = [...children, $color]
      }
      if (isText){
        let $isAutoSize = div({'class_proto-setting-box-item': true},
          span('isAutoSize'),
          checkbox({
            props_value: data['isAutoSize'],
            'on_on-change' (value) {
              me._updateRectTempData(rect)
              data['isAutoSize'] = value
              me._resizeText(rect)
              me._historyAddDataPropChange(rect, [
                'isAutoSize',
                'width',
                'height',
                'top',
                'left',
              ])
            }
          })
        )
        children = [...children, $isAutoSize]
      }
      let $fontSize = div({'class_proto-setting-box-item': true},
        span('fontSize'),
        iInput({
          ...getInputJsxProps('fontSize'),
          'on_on-change' (e) {
            let value = e.target.value
            let intValue = Math.max(12, parseInt(value))
            data['fontSize'] = intValue
            if (data.isAutoSize) {
              me._resizeText(rect)
            }
          },
          'on_on-blur' () {
            me._historyAddDataPropChange(rect, [
              'fontSize',
              'width',
              'height',
              'top',
              'left',
            ])
          },
        })
      )
      children = [...children, $fontSize]
    }
  }
  return div(jsxProps, ...children)
}
export {
  _renderSetting,
}
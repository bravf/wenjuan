import Vue from 'vue'
import jsx from 'vue-jsx'
import tree from './tree'


var data = [
  {
    name: '根节点',
    children: [
      {
        name: '节点1-1',
        children: [
          {
            name: '节点1-1-1',
          }
        ]
      },
      {
        name: '节点1-2',
        children: [
          {
            name: '节点1-2-1',
          },
          {
            name: '节点1-2-2',
          },
          {
            name: '节点1-2-3',
          }
        ]
      },
      {
        name: '节点1-3',
      }
    ]
  }
]
// var data = [
//   {"name":"root","children":[{"name":"node-0","children":[{"name":"node-0-0","children":[{"name":"node-0-0-0"},{"name":"node-0-0-1"},{"name":"node-0-0-2"},{"name":"node-0-0-3"},{"name":"node-0-0-4"},{"name":"node-0-0-5"},{"name":"node-0-0-6"}]},{"name":"node-0-1","children":[{"name":"node-0-1-0"},{"name":"node-0-1-1"},{"name":"node-0-1-2"},{"name":"node-0-1-3"},{"name":"node-0-1-4"},{"name":"node-0-1-5"},{"name":"node-0-1-6"},{"name":"node-0-1-7"},{"name":"node-0-1-8"},{"name":"node-0-1-9"},{"name":"node-0-1-10"},{"name":"node-0-1-11"},{"name":"node-0-1-12"},{"name":"node-0-1-13"}]},{"name":"node-0-2","children":[{"name":"node-0-2-0"},{"name":"node-0-2-1"},{"name":"node-0-2-2"},{"name":"node-0-2-3"},{"name":"node-0-2-4"},{"name":"node-0-2-5"},{"name":"node-0-2-6"},{"name":"node-0-2-7"},{"name":"node-0-2-8"},{"name":"node-0-2-9"},{"name":"node-0-2-10"},{"name":"node-0-2-11"}]},{"name":"node-0-3","children":[{"name":"node-0-3-0"},{"name":"node-0-3-1"}]}]},{"name":"node-1","children":[{"name":"node-1-0","children":[{"name":"node-1-0-0"},{"name":"node-1-0-1"},{"name":"node-1-0-2"},{"name":"node-1-0-3"}]},{"name":"node-1-1","children":[{"name":"node-1-1-0"},{"name":"node-1-1-1"},{"name":"node-1-1-2"},{"name":"node-1-1-3"},{"name":"node-1-1-4"},{"name":"node-1-1-5"},{"name":"node-1-1-6"},{"name":"node-1-1-7"},{"name":"node-1-1-8"},{"name":"node-1-1-9"},{"name":"node-1-1-10"},{"name":"node-1-1-11"},{"name":"node-1-1-12"}]},{"name":"node-1-2","children":[{"name":"node-1-2-0"},{"name":"node-1-2-1"},{"name":"node-1-2-2"},{"name":"node-1-2-3"},{"name":"node-1-2-4"},{"name":"node-1-2-5"}]},{"name":"node-1-3","children":[{"name":"node-1-3-0"},{"name":"node-1-3-1"},{"name":"node-1-3-2"},{"name":"node-1-3-3"},{"name":"node-1-3-4"},{"name":"node-1-3-5"},{"name":"node-1-3-6"},{"name":"node-1-3-7"},{"name":"node-1-3-8"},{"name":"node-1-3-9"}]},{"name":"node-1-4","children":[{"name":"node-1-4-0"},{"name":"node-1-4-1"},{"name":"node-1-4-2"},{"name":"node-1-4-3"},{"name":"node-1-4-4"},{"name":"node-1-4-5"},{"name":"node-1-4-6"},{"name":"node-1-4-7"},{"name":"node-1-4-8"},{"name":"node-1-4-9"},{"name":"node-1-4-10"},{"name":"node-1-4-11"},{"name":"node-1-4-12"},{"name":"node-1-4-13"},{"name":"node-1-4-14"},{"name":"node-1-4-15"},{"name":"node-1-4-16"},{"name":"node-1-4-17"},{"name":"node-1-4-18"},{"name":"node-1-4-19"}]}]},{"name":"node-2","children":[{"name":"node-2-0","children":[{"name":"node-2-0-0"},{"name":"node-2-0-1"},{"name":"node-2-0-2"},{"name":"node-2-0-3"},{"name":"node-2-0-4"},{"name":"node-2-0-5"},{"name":"node-2-0-6"},{"name":"node-2-0-7"},{"name":"node-2-0-8"}]},{"name":"node-2-1","children":[{"name":"node-2-1-0"},{"name":"node-2-1-1"},{"name":"node-2-1-2"},{"name":"node-2-1-3"},{"name":"node-2-1-4"},{"name":"node-2-1-5"},{"name":"node-2-1-6"},{"name":"node-2-1-7"},{"name":"node-2-1-8"},{"name":"node-2-1-9"},{"name":"node-2-1-10"}]},{"name":"node-2-2","children":[{"name":"node-2-2-0"},{"name":"node-2-2-1"},{"name":"node-2-2-2"},{"name":"node-2-2-3"},{"name":"node-2-2-4"},{"name":"node-2-2-5"},{"name":"node-2-2-6"},{"name":"node-2-2-7"},{"name":"node-2-2-8"},{"name":"node-2-2-9"},{"name":"node-2-2-10"},{"name":"node-2-2-11"},{"name":"node-2-2-12"},{"name":"node-2-2-13"},{"name":"node-2-2-14"},{"name":"node-2-2-15"},{"name":"node-2-2-16"},{"name":"node-2-2-17"}]},{"name":"node-2-3","children":[{"name":"node-2-3-0"},{"name":"node-2-3-1"}]},{"name":"node-2-4","children":[{"name":"node-2-4-0"},{"name":"node-2-4-1"},{"name":"node-2-4-2"},{"name":"node-2-4-3"},{"name":"node-2-4-4"},{"name":"node-2-4-5"},{"name":"node-2-4-6"},{"name":"node-2-4-7"},{"name":"node-2-4-8"},{"name":"node-2-4-9"},{"name":"node-2-4-10"},{"name":"node-2-4-11"},{"name":"node-2-4-12"},{"name":"node-2-4-13"},{"name":"node-2-4-14"},{"name":"node-2-4-15"}]}]},{"name":"node-3","children":[{"name":"node-3-0","children":[{"name":"node-3-0-0"},{"name":"node-3-0-1"},{"name":"node-3-0-2"},{"name":"node-3-0-3"}]},{"name":"node-3-1","children":[{"name":"node-3-1-0"},{"name":"node-3-1-1"},{"name":"node-3-1-2"},{"name":"node-3-1-3"},{"name":"node-3-1-4"},{"name":"node-3-1-5"},{"name":"node-3-1-6"},{"name":"node-3-1-7"},{"name":"node-3-1-8"},{"name":"node-3-1-9"},{"name":"node-3-1-10"},{"name":"node-3-1-11"},{"name":"node-3-1-12"},{"name":"node-3-1-13"},{"name":"node-3-1-14"},{"name":"node-3-1-15"},{"name":"node-3-1-16"},{"name":"node-3-1-17"},{"name":"node-3-1-18"},{"name":"node-3-1-19"}]},{"name":"node-3-2","children":[{"name":"node-3-2-0"},{"name":"node-3-2-1"},{"name":"node-3-2-2"},{"name":"node-3-2-3"},{"name":"node-3-2-4"},{"name":"node-3-2-5"},{"name":"node-3-2-6"},{"name":"node-3-2-7"}]},{"name":"node-3-3","children":[{"name":"node-3-3-0"},{"name":"node-3-3-1"},{"name":"node-3-3-2"},{"name":"node-3-3-3"},{"name":"node-3-3-4"},{"name":"node-3-3-5"},{"name":"node-3-3-6"},{"name":"node-3-3-7"}]},{"name":"node-3-4","children":[{"name":"node-3-4-0"},{"name":"node-3-4-1"},{"name":"node-3-4-2"},{"name":"node-3-4-3"},{"name":"node-3-4-4"},{"name":"node-3-4-5"},{"name":"node-3-4-6"},{"name":"node-3-4-7"},{"name":"node-3-4-8"},{"name":"node-3-4-9"},{"name":"node-3-4-10"},{"name":"node-3-4-11"},{"name":"node-3-4-12"},{"name":"node-3-4-13"},{"name":"node-3-4-14"},{"name":"node-3-4-15"},{"name":"node-3-4-16"},{"name":"node-3-4-17"},{"name":"node-3-4-18"},{"name":"node-3-4-19"}]}]},{"name":"node-4","children":[{"name":"node-4-0","children":[{"name":"node-4-0-0"},{"name":"node-4-0-1"},{"name":"node-4-0-2"}]},{"name":"node-4-1","children":[{"name":"node-4-1-0"},{"name":"node-4-1-1"},{"name":"node-4-1-2"}]},{"name":"node-4-2","children":[{"name":"node-4-2-0"},{"name":"node-4-2-1"}]},{"name":"node-4-3","children":[{"name":"node-4-3-0"},{"name":"node-4-3-1"},{"name":"node-4-3-2"},{"name":"node-4-3-3"},{"name":"node-4-3-4"},{"name":"node-4-3-5"},{"name":"node-4-3-6"},{"name":"node-4-3-7"},{"name":"node-4-3-8"},{"name":"node-4-3-9"},{"name":"node-4-3-10"},{"name":"node-4-3-11"},{"name":"node-4-3-12"},{"name":"node-4-3-13"},{"name":"node-4-3-14"}]}]}]}
// ]

var app = new Vue({
  el: '#app',
  components: {
    tree,
  },
  render (h) {
    jsx.h = h
    return jsx.div(
      jsx.create('tree', {
        props_data: data
      })
    )
  }
})
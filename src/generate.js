/*!
 * @copyright 2017- Commenthol
 * @license
 */

const R_NAME = /([a-zA-Z_$][a-zA-Z_$0-9]{0,50})/
export const R_NAME_REPLACE = new RegExp(`\\$\\+{${R_NAME.source}}`, 'g')
const R_NAMED_BACKREF = new RegExp(`^[?:]&${R_NAME.source}`)
const R_GROUP = new RegExp(`^[?:]<${R_NAME.source}>([^]*)`)
const R_GROUPS = /([\\]?[()])/g
const R_EMPTY_GROUPS = /\(\)/g

export function generate (str, flags) {
  str = str || ''
  var groups = {}
  var named = {}
  var source = ''
  /* istanbul ignore else */
  if (str instanceof RegExp) {
    flags = flags || str.flags || ''
    /* istanbul ignore if */
    if (!flags) { // No RegExp.flags for node < v6.
      if (str.ignoreCase) flags += 'i'
      if (str.multiline) flags += 'm'
      if (str.global) flags += 'g'
    }
    str = str.source
  }

  var store = {
    count: 0, // counter for unnamed matching group
    groups: [''], // store for named pattern
    names: [] // store for names of capture groups
  }

  var index = 0
  var arr = str.split(R_GROUPS)
  source = arr.map((s, i) => {
    var name
    var block
    var isGroup = false

    switch (s) {
      case '(':
        store.groups.push('')
        store.names.push('')
        break
      case ')':
        block = store.groups.pop()
        name = store.names.pop()
        /* istanbul ignore else */
        if (name) {
          named[name] = block.substr(1)
        }
        break
      default:
        // is it a real group, not a cluster (?:...), or assertion (?=...), (?!...)
        isGroup = arr[i - 1] === '(' && !/^\?[:!=]/.test(s)

        if (isGroup) {
          index++
          // named capture group check
          name = R_GROUP.exec(s)
          if (name && name[1]) {
            if (!groups[name[1]]) {
              store.names[store.names.length - 1] = name[1]
              groups[name[1]] = index
            } else {
              groups[store.count++] = index
            }
            s = name[2] || ''
            if (arr[i + 1] === ')' && !name[2]) {
              s = '[^]+'
            }
          } else {
            // is not a cluster, assertion or named capture group
            groups[store.count++] = index
          }
          // named backreference check
          name = R_NAMED_BACKREF.exec(s)
          if (name && name[1]) {
            s = named[name[1]] || ''
          }
        }
        break
    }
    store.groups = store.groups.map((group) => {
      return (group + s)
    })

    return s
  })
    .join('')
    .replace(R_EMPTY_GROUPS, '') // remove any empty groups

  return {source, flags, groups, named}
}

#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const blessed = require('blessed')
const contrib = require('blessed-contrib')
const screen = blessed.screen()
const grid = new contrib.grid({rows: 2, cols: 5, screen: screen})

const argv = process.argv

const name = 'raffle.json'
const file = path.resolve(__dirname, name)
const total = parseInt(argv[2]) || 800

const store = {
  get luckies() {
    return read(file)
  }
}

const probability = (C) => {
  return (x) => {
    return parseFloat((1 / (1 + C * Math.tan(x / 5))).toFixed(4))
  }
}

const weight = probability(total);

const write = (luckies, lucky) => {
  luckies = luckies.concat(lucky).reduce((p, n) => {
    const lucky = p.filter(l => l.number === n.number)[0]
    if (lucky) {
      p = p.filter(l => l.number !== n.number)
    }
    n.times = lucky ? lucky.times ++ : (n.times || 1)
    delete n.weight
    p.push(n)
    return p
  }, [])
  fs.writeFileSync(file, JSON.stringify(luckies))
}

const read = (f) => {
  if (!fs.statSync(f).isFile()) {
    return []
  }
  return JSON.parse(fs.readFileSync(f).toString())
    .map(l => {
      const wei = weight(l.times)
      l.weight = wei > 0 ? wei : 0
      return l
    })
}

const random = (luckies, length) => {
  let sum = 0,
    res = [],
    wei = weight(1);

  for (var l in luckies) {
    sum += luckies[l].weight
  }
  sum += (total - luckies.length) * wei
  for (var i = 1; i <= total; i ++) {
    const lucky = luckies.filter(l => l.number === i)[0] || {}
    const w = lucky.weight === 0 ? 0 : ((lucky.weight || wei) + Math.random() * sum)
    res.push(w)
  }
  return res.map((w, i) => {
      return {
        number: i + 1,
        weight: w
      }
    })
    .sort((a, b) => b.weight - a.weight)
    .map(l => {
      delete l.weight
      return l
    })
    .slice(0, length || 1)
}

// Probability Graph
const line = grid.set(0, 2, 1, 2, contrib.line, {
  style: {
    line: 'green',
    text: 'green',
    baseline: 'white'
  },
  xLabelPadding: 3,
  xPadding: 5,
  label: 'Probability For Each Person'
})

line.setData([{
  x: ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
  y: [0.01, 0.0061, 0.0029, 0.0018, 0.0012, 0.0008, 0.0005, 0.0002, 0]
}])


// List of lucky guy
var table = grid.set(0, 0, 1, 2, contrib.table, {
  keys: true,
  fg: 'white',
  selectedFg: 'white',
  selectedBg: 'blue',
  label: 'List Of Lucky Stars',
  width: '30%',
  height: '30%',
  xPadding: '42%',
  border: {
    type: 'line',
    fg: 'cyan'
  },
  columnSpacing: 10, //in chars,
  columnWidth: [6, 10, 16] /*in chars*/
})

table.setData({
  headers: ['Number', 'Lucky Times', 'Next Probability'],
  data: store.luckies.sort((a, b) => b.times - a.times ).map(l => [l.number, l.times, l.weight])
})

var box = grid.set(0, 4, 1, 1, blessed.BigText, {
  content: ' P  ',
  fg: 'yellow'
})

var bigText = grid.set(1, 0, 1, 5, blessed.BigText, {
  content: '',
  scrollable: true,
  fg: 'green'
})

box.on('click', (mouse) => {
  const luckies = store.luckies
  const lucky = random(luckies, 1)

  write(luckies, lucky)

  bigText.setContent(`${lucky[0].number} ${bigText.getContent()}`)
  table.setData({
    headers: ['Number', 'Lucky Times', 'Next Probability'],
    data: store.luckies.sort((a, b) => b.times - a.times ).map(l => [l.number, l.times, l.weight])
  })
  screen.render()
})

screen.key(['escape', 'q', 'C-c'], (ch, key) => {
  return process.exit(0)
})

screen.render()



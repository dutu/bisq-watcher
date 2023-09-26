import systemRules from './systemRules.mjs'
import applicationRules from './applicationRules.mjs'
import tradingRules from './tradingRules.mjs'

const rules= [...applicationRules, /*...tradingRules*/]

export default rules

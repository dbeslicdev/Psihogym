import {test} from 'node:test';
import assert from 'node:assert/strict';
import {priceOrder} from './checkout-contract.mjs';
const catalog={a:{active:true,amountCents:9900}, b:{active:true,amountCents:12900}, off:{active:false,amountCents:100}};
test('server catalog determines the total',()=>assert.equal(priceOrder(['a','b'],catalog).amountCents,22800));
test('rejects empty, duplicate, unknown, inactive and invalid IDs',()=>{for(const ids of [[],['a','a'],['x'],['off'],['__proto__'],[{}]])assert.throws(()=>priceOrder(ids,catalog));});
test('rejects fractional or unsafe monetary values',()=>{for(const amountCents of [1.2,-1,NaN,Infinity])assert.throws(()=>priceOrder(['a'],{a:{active:true,amountCents}}));});

export default function flatten2d(ary) {
  const newAry = [];
  let a;
  let len = ary.length;
  for (let i = 0; i < len; i++) {
    a = ary[i];
    for (let k = 0; k < a.length; k++) {
      newAry.push(a[k]);
    }
  }

  return newAry;
}

export default function tickGen(count, interval, prefix) {
  const qTicks = [];

  for (let i = 0; i < count; i++) {
    qTicks.push({
      qText: `${prefix}${interval > 1 ? i % interval : i}`,
      qStart: i,
      qEnd: i + 1,
    });
  }

  return qTicks;
}

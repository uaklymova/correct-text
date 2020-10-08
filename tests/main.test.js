const estimate = require('../main');
const fs = require('fs')
const MockDate = require('mockdate');

describe("Test week days", () => {
  test('Monday under 10am DOCX', async() => {
    MockDate.set(1601877600000); // 5.10.2020 Mon 09.00
    const file = fs.readFileSync(__dirname +'/../samples/sample.docx');
    const res = await estimate(file, 'ua');
    expect(res).toHaveProperty('cost', 413.15);
    expect(res).toHaveProperty('deadline', 'Mon Oct 05 2020 17:00:00 GMT+0300');
  });
  test('Monday 15pm DOCX', async() => {
    MockDate.set(1601899200000); // 5.10.2020 Mon 15.00
    const file = fs.readFileSync(__dirname +'/../samples/sample.docx')
    const res = await estimate(file, 'ua');
    expect(res).toHaveProperty('deadline', 'Tue Oct 06 2020 13:00:00 GMT+0300');;
  });
  test('Friday 15pm DOCX', async() => {
    MockDate.set(1602244800000); // 9.10 Fr 15.00
    const file = fs.readFileSync(__dirname +'/../samples/sample.docx')
    const res = await estimate(file, 'ua');
    expect(res).toHaveProperty('cost', 413.15);
    expect(res).toHaveProperty('deadline', 'Mon Oct 12 2020 13:00:00 GMT+0300');;
  });
  test('Friday 15pm DOCX eng', async() => {
    MockDate.set(1602244800000); // 9.10 Fr 15.00
    const file = fs.readFileSync(__dirname +'/../samples/sample.docx')
    const res = await estimate(file, 'eng');
    expect(res).toHaveProperty('cost', 991.56);
    expect(res).toHaveProperty('deadline', 'Wed Oct 14 2020 13:30:00 GMT+0300');;
  });
  test('Sat 15pm DOCX', async() => {
    MockDate.set(1602331200000); // 10.10 Sat 15.00
    const file = fs.readFileSync(__dirname +'/../samples/sample.docx')
    const res = await estimate(file, 'ua');
    expect(res).toHaveProperty('cost', 413.15);
    expect(res).toHaveProperty('deadline', 'Mon Oct 12 2020 17:00:00 GMT+0300');;
  });
})

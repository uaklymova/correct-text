const estimate = require('../main');
const fs = require('fs')
const MockDate = require('mockdate');

describe("extension tests", () => {
  beforeEach(() => {
    MockDate.set(1601877600000); // 5.10.2020 Mon 09.00
  })

  test('Test DOCX', async() => {
    const file = fs.readFileSync(__dirname +'/../samples/sample.docx');
    const res = await estimate(file, 'ua', 'sample.docx');
    expect(res).toHaveProperty('cost', 413.15);
    expect(res).toHaveProperty('deadline', 'Mon Oct 05 2020 17:00:00 GMT+0300');
  });

  test('Test DOC', async() => {
    const file = fs.readFileSync(__dirname +'/../samples/sample.doc');
    const res = await estimate(file, 'ua', 'sample.doc');
    expect(res).toHaveProperty('cost', 214.85);
    expect(res).toHaveProperty('deadline', 'Mon Oct 05 2020 14:00:00 GMT+0300');;
  });

  test('Test DOC empty', async() => {
    const file = fs.readFileSync(__dirname +'/../samples/empty.doc');
    const res = await estimate(file, 'ua', 'empty.doc');
    expect(res).toHaveProperty('cost', 50);
    expect(res).toHaveProperty('deadline', 'Mon Oct 05 2020 11:00:00 GMT+0300');;
  });

  test('Test RTF', async() => {
    const file = fs.readFileSync(__dirname +'/../samples/sample.eng.rtf')
    const res = await estimate(file, 'ua', 'sample.eng.rtf');
    expect(res).toHaveProperty('cost', 77.75);
    expect(res).toHaveProperty('deadline', 'Mon Oct 05 2020 12:00:00 GMT+0300');;
  }); 

  test('Test PDF', async() => {
    const file = fs.readFileSync(__dirname +'/../samples/sample.pdf')
    const res = await estimate(file, 'ua', 'sample.pdf');
    expect(res).toHaveProperty('cost', 55.14);
    expect(res).toHaveProperty('deadline', 'Mon Oct 05 2020 11:30:00 GMT+0300');;
  }); 

  test('Test CSV - wrong format', async() => {
    const file = fs.readFileSync(__dirname +'/../samples/sample.csv');
    try {
    const res = await estimate(file, 'ua', 'sample.csv');
    } catch(err) {
      expect(err.message).toBe('Unknown file type.');
    }
  });

  test('Test DOCX - wrong languaege', async() => {
    const file = fs.readFileSync(__dirname +'/../samples/sample.csv');
    try {
    const res = await estimate(file, 'esp', 'sample.docx');
    } catch(err) {
      expect(err.message).toBe('Unsupported language.');
    }
  });
})
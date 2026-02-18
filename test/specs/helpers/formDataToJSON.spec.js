import formDataToJSON from '../../../lib/helpers/formDataToJSON';

describe('formDataToJSON', function () {
  it('should convert a FormData Object to JSON Object', function () {
    const formData = new FormData();

    formData.append('foo[bar][baz]', '123');

    expect(formDataToJSON(formData)).toEqual({
      foo: {
        bar: {
          baz: '123',
        },
      },
    });
  });

  it('should convert repeatable values as an array', function () {
    const formData = new FormData();

    formData.append('foo', '1');
    formData.append('foo', '2');

    expect(formDataToJSON(formData)).toEqual({
      foo: ['1', '2'],
    });
  });

  it('should convert props with empty brackets to arrays', function () {
    const formData = new FormData();

    formData.append('foo[]', '1');
    formData.append('foo[]', '2');

    expect(formDataToJSON(formData)).toEqual({
      foo: ['1', '2'],
    });
  });

  it('should supported indexed arrays', function () {
    const formData = new FormData();

    formData.append('foo[0]', '1');
    formData.append('foo[1]', '2');

    expect(formDataToJSON(formData)).toEqual({
      foo: ['1', '2'],
    });
  });

  it('should resist prototype pollution CVE', () => {
    const formData = new FormData();

    formData.append('foo[0]', '1');
    formData.append('foo[1]', '2');
    formData.append('__proto__.x', 'hack');

    expect(formDataToJSON(formData)).toEqual({
      foo: ['1', '2'],
    });

    expect({}.x).toEqual(undefined);
  });

  it('should block constructor and prototype keys to prevent prototype pollution', () => {
    const formData = new FormData();

    formData.append('constructor.prototype.polluted', 'true');
    formData.append('constructor', 'value');
    formData.append('prototype', 'value');
    formData.append('safe', 'data');

    const result = formDataToJSON(formData);

    expect(result).toEqual({
      safe: 'data',
    });

    // Ensure no prototype pollution occurred
    expect({}.polluted).toEqual(undefined);
    expect(Object.prototype.polluted).toEqual(undefined);
  });

  it('should block nested constructor and prototype keys', () => {
    const formData = new FormData();

    formData.append('foo[constructor][prototype][bar]', 'hack');
    formData.append('foo[safe]', 'data');

    const result = formDataToJSON(formData);

    expect(result.foo.safe).toEqual('data');
    expect({}.bar).toEqual(undefined);
  });
});

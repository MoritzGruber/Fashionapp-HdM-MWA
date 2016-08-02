describe('PresentationService', function () {
  beforeEach(module('starter'));

    it('says hello world!', function () {
      expect(true).toEqual(true);
    });
  it("should find Highest und Lowest value, if all values are equal", inject(function (storage) {
    console.log(storage.getNumber());
    expect(storage.getNumber()).toEqual('Unknown');
  }));

  });


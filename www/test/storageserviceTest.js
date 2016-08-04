describe('StorageService', function () {
  beforeEach(module('starter'));

    it('says hello world!', function () {
      expect(true).toEqual(true);
    });
  it("@storage, getNumber()", inject(function (storage) {
    expect(storage.getNumber()).toEqual('Unknown');
  }));
  it("@storageService, initDB()", inject(function (storageService) {
    storageService.initDB();
    expect(true).toEqual(true);
  }));

  });


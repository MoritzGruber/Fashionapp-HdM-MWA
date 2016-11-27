describe('authService', function () {

  beforeEach(function() {

    module('fittshot');

    inject([
      'authService', function(service) {
        this.service = service;
      }
    ]);

  });

  it('to be defined', function() {
    expect(this.service).toBeDefined();
  });

  it('has  a login function', function() {
    expect(this.service.login()).toBeDefined();
  });

  it('has  a logout function', function() {
    expect(this.service.logout()).toBeDefined();
  });

  it('has  a register function', function() {
    expect(this.service.login()).toBeDefined();
  });

});

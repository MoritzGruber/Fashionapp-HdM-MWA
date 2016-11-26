function sendMailToMailChimp() {

  var mailchimp_api_key = '51a40e64c40164cab8323ec0e8011106-us14';
  var url = 'https://us14.api.mailchimp.com/3.0/lists/db25ba176d/members/';

  var data = {
    "apikey": "fittshot:" + mailchimp_api_key,
    "email_address": $('#mail-input').val(),
    "status": "subscribed",
    "merge_fields": {
      "FNAME": "",
      "LNAME": ""
    }
  };

  $.ajax({
    type: "POST",
    url: url,
    data: data,
    dataType: 'jsonp',
    contentType: 'application/json; charset=utf-8',
    error: function(res, text){
      console.log('Err', res);
    },
    success: function(res){
      console.log('Success', res);
    }
  });
}

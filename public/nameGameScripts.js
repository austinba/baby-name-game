var state = {
  parent: 'mommy',
  gender: 'boy',
  lastName: '',
  email: '',
  waitingOnServer: false,
  foundEmail: false,
  playButtonContent: 'incomplete-text',
  matchedNames: [],
  girlNamesQueue: [],
  boyNamesQueue: [],
};

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') {
        c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
        return c.substring(name.length,c.length);
    }
  }
  return "";
}

function validateEmail(email) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}
function updateNamesQueues() {
  if(state.girlNamesQueue.length < 10) {
    $.get('girl-names', { count: '10' }, function(data) {
      if(Array.isArray(data.names)) state.girlNamesQueue.concat(data.names);
      setState('currentName', data.names[0]);
    });
  }
  if(state.boyNamesQueue.length < 10) {
    $.get('boy-names', { count: '10' }, function(data) {
      if(Array.isArray(data.names)) state.boyNamesQueue.concat(data.names);
      setState('currentName', data.names[0]);
    });
  }
}
updateNamesQueues();

function setState(context, value) {

  // Toggle Parent Button
  if (context === 'parent') {
    if(value === 'daddy') {
      state.parent = 'daddy';
      $('#future-mommy-button').addClass('button-unselected');
      $('#future-daddy-button').removeClass('button-unselected');
    } else {
      state.parent = 'mommy';
      $('#future-daddy-button').addClass('button-unselected');
      $('#future-mommy-button').removeClass('button-unselected');
    }
    setCookie('parent', state.parent, 100);
  }

  // Toggle Gender Button
  if (context === 'gender') {
    if(value === 'girl') {
      state.gender = 'girl';
      $('#boy-button').addClass('button-unselected');
      $('#girl-button').removeClass('button-unselected');
    } else {
      state.gender = 'boy';
      $('#girl-button').addClass('button-unselected');
      $('#boy-button').removeClass('button-unselected');
    }
  }
  // Input in text fields
  else if (context === 'lastName') {
    state.lastName = value;
    $('#last-name').val(state.lastName);
    $('#last-name-display').text(state.lastName);
  }
  else if (context === 'email') {
    state.email = value;
    state.waitingOnServer = true;
    $('#email').val(state.email);
    setCookie('email', state.email, 100);
  }

  else if (context === 'waitingOnServer') {
    state.waitingOnServer = !!value;
  }
  else if (context === 'matchedNames') {
    state.matchedNames = value;
    var allMatches = $('#all-matches');
    allMatches.empty();
    for (var i = 0; i < state.matchedNames.length; i++) {
      allMatches.append($('<p />').text(state.matchedNames[i]));
    }
  }
  else if (context === 'foundEmail') {
    state.foundEmail = !!value;
  }

  // gamme play
  else if (context === 'currentName') {
    state.currentName = value;
    $('#first-name-display').text(state.currentName);
  }

  // Form Validation / Response
  playButtonContentChanged = false;
  if (context === 'lastName' || context === 'email' || context === 'foundEmail') {
    if(state.lastName === '' || state.email === '') {
      if(state.playButtonContent !== 'incomplete-text') {
        state.playButtonContent = 'incomplete-text';
        playButtonContentChanged = true;
      }
    } else if(!validateEmail(state.email)) {
      if(state.playButtonContent !== 'bad-email-text') {
        state.playButtonContent = 'bad-email-text';
        playButtonContentChanged = true;
      }
    } else if(state.waitingOnServer) {
      if(state.playButtonContent !== 'loading-text') {
        state.playButtonContent = 'loading-text';
        playButtonContentChanged = true;
      }
    } else if(state.foundEmail) {
      if(state.playButtonContent !== 'resume-playing-text') {
        state.playButtonContent = 'resume-playing-text';
        playButtonContentChanged = true;
      }
    } else {
      if(state.playButtonContent !== 'new-game-text') {
        state.playButtonContent = 'new-game-text';
        playButtonContentChanged = true;
      }
    }
  }
  if(playButtonContentChanged) {
    $('#start-playing-button span').hide();
    $('#start-playing-button .' + state.playButtonContent).show();
  }
};


// document.ready
$(document).ready(function() {
  setState('email', getCookie('email'));
  setState('parent', getCookie('parent'));
  // mommy / daddy selectors
  $('#future-daddy-button').click(function() {
    setState('parent', 'daddy');
  });
  $('#future-mommy-button').click(function() {
    setState('parent', 'mommy');
  });
  // boy / girl selectors
  $('#boy-button').click(function() {
    setState('gender', 'boy');
    $.post(
      'gender',
      { email: state.email, gender: 'boy' }
    );
  });
  $('#girl-button').click(function() {
    setState('gender', 'girl');
    $.post(
      'gender',
      { email: state.email, gender: 'girl' }
    );
  });
  // update state with input fields
  $('#last-name').on('input', function() {
    setState('lastName', this.value);
    $.post(
      'last-name',
      { email: state.email, lastName: state.lastName}
    );
  });
  $('#email').on('input', function() {
    setState('email', this.value);
    if(validateEmail(state.email)) {
      $.get(
        'matches-so-far',
        {
          email: state.email
        },
        function(data) {
          setState('waitingOnServer', false);
          setState('matchedNames', data.matchedNames);
          setState('foundEmail', data.foundEmail);
          setState('lastName', data.lastName || '');
          setState('gender', data.gender || 'boy');
      });
    }
  });
  // return to detail view
  $('.namegame-header').click(function() {
    if(!$(this).hasClass('namegame-header-full')) {
      $(this).addClass('namegame-header-full');
    }
  });
  // "Start Playing" button
  $('#start-playing-button').click(function() {
    // delay because the .namegame-header click handler depends on checking
    // for presence of the namegame-header-full class
    setTimeout(function() {
      $('.namegame-header-full').removeClass('namegame-header-full');
    }, 0);
  });
})

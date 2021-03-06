var state = {
  parent: 'mommy',
  genderSelection: 'boy',
  gender: 'boy',
  lastName: '',
  email: '',
  waitingOnServer: false,
  foundEmail: false,
  playButtonContent: 'incomplete-text',
  matchedNames: [],
  girlNamesQueue: [],
  boyNamesQueue: [],
  playButtonClickable: false,
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
      if(Array.isArray(data.names)) setState('concatGirlNames', data.names);
    });
  }
  if(state.boyNamesQueue.length < 10) {
    $.get('boy-names', { count: '10' }, function(data) {
      if(Array.isArray(data.names)) setState('concatBoyNames', data.names);
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
  else if (context === 'genderSelection') {
    if(value === 'girl') {
      setState('gender', 'girl');
      state.genderSelection = 'girl';
      $('#boy-button').addClass('button-unselected');
      $('#alternate-button').addClass('button-unselected');
      $('#girl-button').removeClass('button-unselected');
    } else if (value === 'boy') {
      setState('gender', 'boy');
      state.genderSelection = 'boy';
      $('#girl-button').addClass('button-unselected');
      $('#alternate-button').addClass('button-unselected');
      $('#boy-button').removeClass('button-unselected');
    } else {
      setState('randomizeGender');
      state.genderSelection = 'alternate';
      $('#girl-button').addClass('button-unselected');
      $('#boy-button').addClass('button-unselected');
      $('#alternate-button').removeClass('button-unselected');
    }
  }

  else if (context === 'gender') {
    if(value === 'girl') {
      state.gender = 'girl';
      $('#match-made-sign').addClass('c4').removeClass('c3');
      $('#current-name-label').addClass('c4').removeClass('c3');
    } else {
      state.gender = 'boy';
      $('#match-made-sign').addClass('c3').removeClass('c4');
      $('#current-name-label').addClass('c3').removeClass('c4');
    }
  }

  else if(context === 'randomizeGender') {
    setState('gender', Math.random() > 0.5 ? 'boy' : 'girl');
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
    setCookie('email', state.email.toLowerCase(), 100);
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
          setState('genderSelection', data.gender || 'boy');
      });
    }
  }
  else if (context === 'waitingOnServer') {
    state.waitingOnServer = !!value;
  }
  else if (context === 'matchedNames') {
    state.matchedNames = value;
    var allMatches = $('#all-matches');
    allMatches.empty();
    for (var i = 0; i < state.matchedNames.length; i++) {
      var color = state.matchedNames[i].gender === 'boy' ? 'c1' : 'c5';
      allMatches.append($('<p />').text(state.matchedNames[i].name).addClass(color));
    }
  }
  else if (context === 'foundEmail') {
    state.foundEmail = !!value;
  }

  // gamme play
  else if (context === 'concatBoyNames') {
    state.boyNamesQueue = state.boyNamesQueue.concat(value);
    if(state.gender === 'boy') $('#first-name-display').text(state.boyNamesQueue[0]);
  }
  else if (context === 'concatGirlNames') {
    state.girlNamesQueue =  state.girlNamesQueue.concat(value);
    if(state.gender === 'girl') $('#first-name-display').text(state.girlNamesQueue[0]);
  }
  else if (context === 'dequeueFirstName') {
    var dequeuedName;
    if(state.genderSelection === 'alternate') setState('randomizeGender');
    if(state.gender === 'boy') {
      dequeuedName = state.boyNamesQueue.shift();

      $('#first-name-display').text(state.boyNamesQueue[0]);
    } else {
      dequeuedName = state.girlNamesQueue.shift();
      $('#first-name-display').text(state.girlNamesQueue[0]);
    }
    updateNamesQueues();
    return dequeuedName;
  }
  else if (context === 'playButtonClickable') {
    state.playButtonClickable = value ? true : false;
    if(!state.playButtonClickable) {
      $('#start-playing-button').addClass('button-inactive');
    }
    else {
      $('#start-playing-button').removeClass('button-inactive');
    }
  }
  else if (context === 'addMatch') {
    state.matchedNames.push({ name: value.name, gender: value.gender });
    var color = value.gender === 'boy' ? 'c1' : 'c5';
    $('#all-matches').append($('<p />').text(value.name).addClass(color));
    $('#matched-name').text(value.name);
    $('#match-made-sign').slideDown(100);
    setTimeout(function() {
      $('#match-made-sign').slideUp(100);
    }, 400);
  }

  // Form Validation / Response
  playButtonContentChanged = false;
  if (context === 'lastName' || context === 'email' || context === 'foundEmail') {
    if(!validateEmail(state.email)) {
      if(state.playButtonContent !== 'bad-email-text') {
        state.playButtonContent = 'bad-email-text';
        setState('playButtonClickable', false);
        playButtonContentChanged = true;
      }
    } else if(state.lastName === '' || state.email === '') {
      if(state.playButtonContent !== 'incomplete-text') {
        state.playButtonContent = 'incomplete-text';
        setState('playButtonClickable', false);
        playButtonContentChanged = true;
      }
    } else if(state.waitingOnServer) {
      if(state.playButtonContent !== 'loading-text') {
        state.playButtonContent = 'loading-text';
        setState('playButtonClickable', false);
        playButtonContentChanged = true;
      }
    } else if(state.foundEmail) {
      if(state.playButtonContent !== 'resume-playing-text') {
        state.playButtonContent = 'resume-playing-text';
        setState('playButtonClickable', true);
        playButtonContentChanged = true;
      }
    } else {
      if(state.playButtonContent !== 'new-game-text') {
        state.playButtonContent = 'new-game-text';
        setState('playButtonClickable', true);
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
  setState('email', getCookie('email').toLowerCase());
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
    setState('genderSelection', 'boy');
    $.post(
      'gender',
      { email: state.email, gender: 'boy' }
    );
  });
  $('#girl-button').click(function() {
    setState('genderSelection', 'girl');
    $.post(
      'gender',
      { email: state.email, gender: 'girl' }
    );
  });
  $('#alternate-button').click(function() {
    setState('genderSelection', 'alternate');
    $.post(
      'gender',
      { email: state.email, gender: 'alternate' }
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
  });
  // return to detail view
  $('.namegame-header').click(function() {
    if(!$(this).hasClass('namegame-header-full')) {
      $(this).addClass('namegame-header-full');
      setState('email', state.email); // refresh screen with any new matches
    }
  });
  // "Start Playing" button
  $('#start-playing-button').click(function() {
    // delay because the .namegame-header click handler depends on checking
    // for presence of the namegame-header-full class
    if(state.playButtonClickable) {
      setTimeout(function() {
        $('.namegame-header-full').removeClass('namegame-header-full');
      }, 0);
    }
  });
  $('#love-button').click(function() {
    var name = setState('dequeueFirstName');
    $.post(
      'love-name',
      { name: name, gender: state.gender, email: state.email, parent: state.parent},
      function(data) {
        if(data.matchFound) {
          setState('addMatch', { name: data.name, gender: data.gender });
        }
      }
    );
  });
  $('#love-button, #next-button, #start-playing-button, .namegame-header')
  .bind('mousedown touchstart', function() {
    if(!$(this).hasClass('namegame-header-full')) $(this).addClass('button-depressed');
  })
  .bind('mouseup touchend', function() {
    $(this).removeClass('button-depressed');
  });
  $('#next-button').click(function() {
    setState('dequeueFirstName');
  });
});

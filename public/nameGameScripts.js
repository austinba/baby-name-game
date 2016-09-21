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

var updateNamesQueues = function() {
  if(state.girlNamesQueue.length < 10) {
    $.get('girl-names', { count: '10' }, function(data) {
      if(Array.isArray(data.names)) state.girlNamesQueue.concat(data.names);
    });
  }
  if(state.boyNamesQueue.length < 10) {
    $.get('boy-names', { count: '10' }, function(data) {
      if(Array.isArray(data.names)) state.boyNamesQueue.concat(data.names);
    });
  }
}
updateNamesQueues();

var setState = function(context, value) {

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
  // Form Validation / Response
  playButtonContentChanged = false;
  if (context === 'lastName' || context === 'email' || context === 'foundEmail') {
    if(state.lastName === '' || state.email === '') {
      if(state.playButtonContent !== 'incomplete-text') {
        state.playButtonContent = 'incomplete-text';
        playButtonContentChanged = true;
      }
    } else if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(state.email)) {
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
$(document).ready(function() {
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
    if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(state.email)) {
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

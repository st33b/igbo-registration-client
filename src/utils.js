import axios from "axios";
import {
  bowlerCommerceDetailsRetrieved,
  teamDetailsRetrieved,
  teamListRetrieved,
  tournamentDetailsRetrieved,
} from "./store/actions/registrationActions";

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

export const doesNotEqual = (rows, id, filterValue) => {
  return rows.filter(row => {
    const rowValue = row.values[id];
    return rowValue !== filterValue;
  });
};

export const lessThan = (rows, id, filterValue) => {
  return rows.filter(row => {
    const rowValue = row.values[id];
    return rowValue < filterValue;
  });
};

///////////////////////////////////////////////////

export const apiHost = `${process.env.NEXT_PUBLIC_API_PROTOCOL}://${process.env.NEXT_PUBLIC_API_HOSTNAME}:${process.env.NEXT_PUBLIC_API_PORT}`;

export const fetchTournamentList = (onSuccess, onFailure) => {
  const requestConfig = {
    method: 'get',
    url: `${apiHost}/tournaments`,
    headers: {
      'Accept': 'application/json',
    },
    validateStatus: (status) => { return status < 500 },
  };
  axios(requestConfig)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        onSuccess(response.data);
      } else {
        onFailure(response.data);
      }
    })
    .catch(error => {
      onFailure({error: error.message});
    });

}

export const fetchTournamentDetails = (identifier, ...dispatches) => {
  const requestConfig = {
    method: 'get',
    url: `${apiHost}/tournaments/${identifier}`,
    headers: {
      'Accept': 'application/json',
    }
  }
  axios(requestConfig)
    .then(response => {
      dispatches.map(dispatch => {
        dispatch(tournamentDetailsRetrieved(response.data));
      });
    })
    .catch(error => {
      // Let's dispatch a failure, because that's a big deal
    });

}

export const fetchTeamDetails = ({teamIdentifier, onSuccess, onFailure, dispatches}) => {
  const requestConfig = {
    method: 'get',
    url: `${apiHost}/teams/${teamIdentifier}`,
    headers: {
      'Accept': 'application/json',
    },
    validateStatus: (status) => { return status < 500 },
  }
  axios(requestConfig)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        dispatches.map(dispatch => {
          dispatch(teamDetailsRetrieved(response.data));
        });
        onSuccess(response.data);
      } else {
        onFailure(response.data);
      }
    })
    .catch(error => {
      onFailure({error: 'Unexpected error from the server'});
    });

}

export const fetchBowlerDetails = (bowlerIdentifier, commerceObj, commerceDispatch) => {
  const requestConfig = {
    method: 'get',
    url: `${apiHost}/bowlers/${bowlerIdentifier}`,
    headers: {
      'Accept': 'application/json',
    }
  }
  axios(requestConfig)
    .then(response => {
      const bowlerData = response.data.bowler;
      const availableItems = response.data.available_items;
      commerceDispatch(bowlerCommerceDetailsRetrieved(bowlerData, availableItems));

      // Make sure the tournament in context matches that of the bowler.
      // If it doesn't, retrieve the bowler's tournament so we can put it
      // into context.
      if (commerceObj.tournament) {
        const contextTournamentId = commerceObj.tournament.identifier;
        const bowlerTournamentId = bowlerData.tournament.identifier;

        if (contextTournamentId !== bowlerTournamentId) {
          fetchTournamentDetails(bowlerTournamentId, commerceDispatch);
        }
      }
    })
    .catch(error => {
      // Display some kind of error message
      console.log('Whoops!');
    });
}

export const fetchTeamList = ({tournamentIdentifier, dispatch, onSuccess, onFailure, incomplete = false}) => {
  const queryParams = {};
  if (incomplete) {
    queryParams.incomplete = true;
  }
  const requestConfig = {
    method: 'get',
    url: `${apiHost}/tournaments/${tournamentIdentifier}/teams`,
    headers: {
      'Accept': 'application/json',
    },
    params: queryParams,
    validateStatus: (status) => { return status < 500 },
  }
  axios(requestConfig)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        dispatch(teamListRetrieved());
        onSuccess(response.data);
      } else {
        onFailure(response.data);
      }
    })
    .catch(error => {
      onFailure({error: 'Unexpected error from the server'});
    });
}

////////////////////////////////////////////////////

export const submitNewTeamRegistration = (tournament, teamName, bowlers, onSuccess, onFailure) => {
  const postData = convertTeamDataForServer(tournament, teamName, bowlers);

  const requestConfig = {
    method: 'post',
    url: `${apiHost}/tournaments/${tournament.identifier}/teams`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    data: postData,
  }
  axios(requestConfig)
    .then(response => {
      onSuccess(response.data);
    })
    .catch(error => {
      console.log("Entry submission failed.");
      console.log(error);
      onFailure(error.response.data);
    });

}

export const submitJoinTeamRegistration = (tournament, team, bowler, onSuccess, onFailure) => {
  // make the post
  const bowlerData = { bowler: convertBowlerDataForPost(tournament, bowler) };
  console.log(bowler);
  const teamId = team.identifier;
  axios.post(`${apiHost}/teams/${teamId}/bowlers`, bowlerData)
    .then(response => {
      const newBowlerIdentifier = response.data.identifier;
      onSuccess(newBowlerIdentifier);
    })
    .catch(error => {
      console.log('womp womp');
      console.log(error);
      console.log(error.response);
      onFailure(error.response.status);
    });

}

const convertTeamDataForServer = (tournament, teamName, bowlers) => {
  let postData = {
    team: {
      name: teamName,
      bowlers_attributes: []
    }
  };
  for (const bowler of bowlers) {
    postData.team.bowlers_attributes.push(
      convertBowlerDataForPost(tournament, bowler)
    );
  }
  return postData;
}

const convertBowlerDataForPost = (tournament, bowler) => {
  const additionalQuestionResponses = convertAdditionalQuestionResponsesForPost(tournament, bowler);
  return {
    position: bowler.position,
    doubles_partner_num: bowler.doubles_partner_num,
    person_attributes: {
      first_name: bowler.first_name,
      last_name: bowler.last_name,
      usbc_id: bowler.usbc_id,
      igbo_id: bowler.igbo_id,
      birth_month: bowler.birth_month,
      birth_day: bowler.birth_day,
      nickname: bowler.nickname,
      phone: bowler.phone,
      email: bowler.email,
      address1: bowler.address1,
      address2: bowler.address2,
      city: bowler.city,
      state: bowler.state,
      country: bowler.country,
      postal_code: bowler.postal_code,
    },
    additional_question_responses: additionalQuestionResponses,
  };
}

const convertAdditionalQuestionResponsesForPost = (tournament, bowler) => {
  const responses = [];
  for (let key in tournament.additional_questions) {
    responses.push({
      name: key,
      response: bowler[key] || '',
    });
  }
  return responses;
}

////////////////////////////////////////////////

export const postFreeEntry = (tournamentIdentifier, postData, onSuccess, onFailure) => {
  const requestConfig = {
    method: 'post',
    url: `${apiHost}/tournaments/${tournamentIdentifier}/free_entries`,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    data: postData,
    validateStatus: (status) => { return status < 500 },
  }
  axios(requestConfig)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        onSuccess(response.data);
      } else {
        onFailure(response.data);
      }
    })
    .catch(error => {
      onFailure({error: error.message});
    });
}

export const postPurchaseDetails = (bowlerIdentifier, postData, onSuccess, onFailure) => {
  const requestConfig = {
    method: 'post',
    url: `${apiHost}/bowlers/${bowlerIdentifier}/purchase_details`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    data: postData,
    validateStatus: (status) => { return status < 500 },
  }
  axios(requestConfig)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        onSuccess(response.data);
      } else {
        onFailure(response.data);
      }
    })
    .catch(error => {
      onFailure({error: error.message});
    });
}

export const postPurchasesCompleted = (bowlerIdentifier, postData, onSuccess, onFailure) => {
  const requestConfig = {
    method: 'post',
    url: `${apiHost}/bowlers/${bowlerIdentifier}/purchases`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    data: postData,
    validateStatus: (status) => { return status < 500 },
  }
  axios(requestConfig)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        onSuccess(response.data);
      } else {
        onFailure(response.data);
      }
    })
    .catch(error => {
      onFailure({error: error.message});
    });
}

////////////////////////////////////////////////

export const directorForgotPasswordRequest = (postData, onSuccess, onFailure) => {
  const url = `${apiHost}/password`;
  const requestConfig = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    url: url,
    validateStatus: (status) => { return status < 500 },
    data: postData,
  }
  axios(requestConfig)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        onSuccess();
      } else if (response.status === 422) {
        onSuccess();
      } else {
        console.log(response.data);
        onFailure(response.data);
      }
    })
    .catch(error => {
      if (error.request) {
        console.log('No response was received.');
        onFailure({error: 'The server did not respond'});
      } else {
        console.log('Exceptional error', error.message);
        onFailure({error: error.message});
      }
    });
}

export const directorResetPasswordRequest = (postData, onSuccess, onFailure) => {
  const url = `${apiHost}/password`;
  const requestConfig = {
    method: 'patch',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    url: url,
    validateStatus: (status) => { return status < 500 },
    data: postData,
  }
  axios(requestConfig)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        console.log(response.headers)
        onSuccess(response.data);
      } else if (response.status === 422) {
        onFailure(response.data.error);
      } else {
        console.log(response.data);
        onFailure(response.data);
      }
    })
    .catch(error => {
      if (error.request) {
        console.log('No response was received.');
        onFailure({error: 'The server did not respond'});
      } else {
        console.log('Exceptional error', error.message);
        onFailure({error: error.message});
      }
    });
}

////////////////////////////////////////////////

export const directorApiRequest = ({uri, requestConfig, context, router, onSuccess = null, onFailure = null}) => {
  const url = `${apiHost}${uri}`;
  const config = {...requestConfig};
  config.url = url;
  config.headers = {...requestConfig.headers}
  config.headers['Accept'] = 'application/json';
  config.headers['Authorization'] = context.token;
  config.validateStatus = (status) => { return status < 500 }
  axios(config)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        onSuccess(response.data);
      } else if (response.status === 401) {
        context.logout();
        router.push('/director/login');
      } else {
        onFailure(response.data);
      }
    })
    .catch(error => {
      if (error.request) {
        console.log('No response was received.');
        onFailure({error: 'The server did not respond'});
      } else {
        console.log('Exceptional error', error.message);
        onFailure({error: error.message});
      }
    });
}

export const directorApiDownloadRequest = ({uri, context, router, onSuccess = null, onFailure = null}) => {
  const url = `${apiHost}${uri}`;
  const config = {
    method: 'get',
    url: url,
    headers: {
      'Authorization': context.token,
    },
    responseType: 'blob',
    validateStatus: (status) => {
      return status < 500
    },
  }
  axios(config)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        onSuccess(response.data);
      } else if (response.status === 401) {
        context.logout();
        router.push('/director/login');
      } else {
        onFailure(response.data);
      }
    })
    .catch(error => {
      if (error.request) {
        console.log('No response was received.');
        onFailure({error: 'The server did not respond'});
      } else {
        console.log('Exceptional error', error.message);
        onFailure({error: error.message});
      }
    });
}

export const directorApiLoginRequest = ({userCreds, context, onSuccess = null, onFailure = null}) => {
  const config = {
    url: `${apiHost}/login`,
    headers: {
      'Accept': 'application/json',
    },
    method: 'post',
    data: userCreds,
    validateStatus: (status) => { return status < 500 },
  };
  axios(config)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        const authHeader = response.headers.authorization;
        const userData = response.data;
        context.login(authHeader, userData);
        onSuccess(response.data);
      } else {
        onFailure(response.data);
      }
    })
    .catch(error => {
      if (error.request) {
        console.log('No response was received.');
        onFailure({error: 'The server did not respond'});
      } else {
        console.log('Exceptional error', error.message);
        onFailure({error: error.message});
      }
    });
}

export const directorApiLogoutRequest = ({context, onSuccess, onFailure}) => {
  const config = {
    url: `${apiHost}/logout`,
    headers: {
      'Accept': 'application/json',
    },
    method: 'delete',
    validateStatus: (status) => { return status < 500 },
  };
  axios(config)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        context.logout();
        onSuccess();
      } else {
        onFailure({error: 'Got a strange response from the server.'});
      }
    })
    .catch(error => {
      if (error.request) {
        console.log('No response was received.');
        onFailure({error: 'The server did not respond'});
      } else {
        console.log('Exceptional error', error.message);
        onFailure({error: error.message});
      }
    });
}

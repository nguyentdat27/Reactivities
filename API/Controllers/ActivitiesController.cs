﻿using Application.Activities;
using Domain;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace API.Controllers
{

    public class ActivitiesController : BaseApiController
    {

        [HttpGet]
        public async Task<ActionResult<List<Activity>>> GetActivities(CancellationToken cancellationToken)
        {
            return await MyMediator.Send(new ListActivities.Query(), cancellationToken);
        }
        [HttpGet("{id}")] // activities/{id}
        public async Task<ActionResult<Activity>> GetActivity(Guid id)
        {
            var activity = await MyMediator.Send(new Details.Query { Id = id });
            return activity == null ? NotFound() : Ok(activity);
        }
        [HttpPost]
        public async Task<IActionResult> CreateActivity([FromBody] Activity activity)
        {
            return Ok(await MyMediator.Send(new Create.Command { Activity = activity }));
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> EditActivity(Guid id, Activity activity)
        {
            activity.Id = id;
            return Ok(await MyMediator.Send(new Edit.Command { Activity = activity }));
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivity(Guid id)
        {
            return Ok(await MyMediator.Send(new Delete.Command { Id = id }));
        }
    }
}

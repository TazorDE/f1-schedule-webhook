const eventData = {
    title: '',
    displayDate: '',
    circuit: '',
    country: '',
    sessions: []
}

const embed = {
    content: null,
    embeds: [{
        title: '',
        description: '',
        color: 16711680,
        fields: [],
        timestamp: new Date().toISOString(),
    }],
    "attachments": []
};

const main = async () => {
    let jsonData = await fetch("https://f1tv.formula1.com/2.0/R/ENG/WEB_DASH/ALL/PAGE/395/PRO/14", {
        "headers": {
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Sec-Fetch-Mode": "cors",
        },
        "method": "GET",
        "mode": "cors"
    }).then(response => response.json())


    // get jsonData.resultObj.containers[] where layout == interactive_schedule
    let schedule = jsonData.resultObj.containers.find(container => container.layout == "interactive_schedule")
    eventData.title = schedule.meeting.metadata.emfAttributes.Meeting_Official_Name;
    eventData.circuit = schedule.meeting.metadata.emfAttributes.Circuit_Short_Name;
    eventData.displayDate = schedule.meeting.metadata.emfAttributes.Meeting_Display_Date;
    eventData.country = schedule.meeting.metadata.emfAttributes.Meeting_Country_Name;

    let sessions = schedule.retrieveItems.resultObj.containers.find(container => container.eventName == 'ALL')
    sessions.events.forEach((data) => {
        eventData.sessions.push({
            title: data.metadata.title,
            startDate: data.metadata.emfAttributes.sessionStartDate,
            series: data.metadata.uiSeries,
        });
    });

    // sort eventData.sessions by startDate
    eventData.sessions.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

    // build embed
    let embedRef = embed.embeds[0];
    embedRef.title = eventData.title;
    embedRef.description = `${eventData.displayDate}\n${eventData.circuit}, ${eventData.country}`;
    embedRef.fields = eventData.sessions.map((session) => {
        let sessionDate = new Date(session.startDate);
        return {
            name: `${session.series}: ${session.title}`,
            // German date format, e.g. "Dienstag, 23. November 2021"
            value: `${sessionDate.toLocaleDateString('de-DE', { weekday: 'long' })} ${sessionDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`,
        }
    });

    // send embed to discord webhook
    const url = process.env.WEBHOOK_URL;
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(embed),
    });
}

main()

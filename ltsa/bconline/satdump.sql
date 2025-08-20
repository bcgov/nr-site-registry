spool satdump.lis;
select all substr(to_char(site_id,'0999999999'),2,10)  siteid,
           substr(to_char(event_id,'0999999999'),2,10) eventid,
           event_type,
           event_class,
           to_char(event_date,'YYYY-MM-DD')            eventdate,
           to_char(approval_date,'YYYY-MM-DD')         approval_date,
           ministry_contact,
           replace(note,chr(10),' ')                   note,
           replace(required_action,chr(10),' ')        required_action
   from    sr_events
   where site_id between 4788 and 4792
   order   by site_id, event_date desc;
select to_char(sysdate,'HH:MI:SS') from dual;
spool off;
exit;


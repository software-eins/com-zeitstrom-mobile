import { Day, WorkmonthDetail, workmonthService } from "@/services/workmonths";

export async function getWorkmonth(date: string, employeeId: string): Promise<WorkmonthDetail> {
  const listParams = {
    years: [parseInt(date.slice(0, 4))],
    months: [parseInt(date.slice(5, 7))],
    employeeIds: [employeeId],
    verbosity: 'detail',
  }

  const response = await workmonthService.listParams(listParams);
  if (response.data.count == 0) console.error("[zs] Expected workmonth, but does not exist.");

  return response.data.results[0];
}

export function isWorkDay(day: Day): boolean {
  for (const dayOffReason of day.day_off_reasons || []) {
    if (dayOffReason.type == 'no-work-day') return false;
    if (dayOffReason.type == 'public-holiday') return false;
  }
  return true;
}

export function getDailyWorkTime(workmonth: WorkmonthDetail): number {
  let targetWorktime = workmonth.target_worktime;
  let workdayCount = 0;

  for (const day of workmonth.calendar) {
    if (isWorkDay(day)) workdayCount += 1;
    for (const missingDay of day.missing_days || []) {
      if (missingDay.target_hour_behaviour == "substract_from_target_hours") {
        targetWorktime += missingDay.affected_hours * 3600;
      }
    }
  }

  return targetWorktime / Math.max(workdayCount, 1);
}

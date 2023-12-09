import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'eventFilter'
})
export class EventFilterPipe implements PipeTransform {
  transform(events: any[], startDateFilter: Date | null, locationFilter: string | null, categoryFilter: string | null): any[] {
    if (!events) {
      return [];
    }

    return events.filter(event => {
      return (!startDateFilter || event.startDate >= startDateFilter)
        && (!locationFilter || event.location.includes(locationFilter))
        && (!categoryFilter || event.category === categoryFilter);
    });
  }
}

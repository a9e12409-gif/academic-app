import { useEffect, useState } from "react";
import { BookOpen, FlaskConical, GraduationCap, NotebookPen, Plus } from "lucide-react";
import CourseSheet from "../components/CourseSheet";
import EmptyState from "../components/EmptyState";
import { DAYS } from "../constants";
import { fmt12, today, mins } from "../lib/utils";
import { courseNextSession } from "../lib/planner";

const ICONS = [<BookOpen size={17} />, <FlaskConical size={17} />, <NotebookPen size={17} />];

export default function CoursesView({ data, api, initialCourseId }) {
  const [courseId, setCourseId] = useState(initialCourseId || "");
  const chosen = data.courses.find(c => c.id === courseId);
  const dayNow = today(), nowM = new Date().getHours() * 60 + new Date().getMinutes();

  useEffect(() => {
    if (initialCourseId) {
      setCourseId(initialCourseId);
      api.clearJump();
    }
  }, [initialCourseId]);

  if (!data.courses.length) {
    return (
      <EmptyState icon={<GraduationCap />} title="ابدأ بمادة"
        text="اعمل مادة أو سجّل موعد من اليوم وهتظهر هنا لوحدها."
        action={<button className="primary ripple-host pressable" onClick={() => api.newCourse()}><Plus size={15} /> إضافة مادة</button>} />
    );
  }

  return (
    <section className="view">
      <div className="course-grid">
        {data.courses.map((c, i) => {
          const next = courseNextSession(data, c.id, dayNow, nowM);
          return (
            <button key={c.id} className="course-card pressable" onClick={() => setCourseId(c.id)}>
              <i className={"course-icon c" + (i % 3)}>{ICONS[i % 3]}</i>
              <strong>{c.name}</strong>
              <small>{next ? DAYS[next.session.day] + " · " + fmt12(next.session.start) : "مفيش مواعيد"}</small>
            </button>
          );
        })}
      </div>

      {chosen && <CourseSheet course={chosen} data={data} api={api} close={() => setCourseId("")} />}
    </section>
  );
}

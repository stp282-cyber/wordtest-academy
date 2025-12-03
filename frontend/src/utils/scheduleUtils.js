// Shared utility functions for curriculum schedule generation

// Day mapping
export const dayMap = {
    'mon': '월',
    'tue': '화',
    'wed': '수',
    'thu': '목',
    'fri': '금'
};

// Parse units from wordbook
export const getUnits = (words) => {
    const units = [];
    if (!words || !words.length) return units;

    let currentMajor = words[0].major;
    let currentMinor = words[0].minor;
    let startIndex = 0;

    for (let i = 1; i < words.length; i++) {
        // Check if unit changed (either major or minor changed)
        if (words[i].major != currentMajor || words[i].minor != currentMinor) {
            units.push({
                major: currentMajor,
                minor: currentMinor,
                startIndex: startIndex,
                endIndex: i, // exclusive
                count: i - startIndex,
                words: words.slice(startIndex, i)
            });
            currentMajor = words[i].major;
            currentMinor = words[i].minor;
            startIndex = i;
        }
    }
    // Add last unit
    units.push({
        major: currentMajor,
        minor: currentMinor,
        startIndex: startIndex,
        endIndex: words.length,
        count: words.length - startIndex,
        words: words.slice(startIndex, words.length)
    });

    return units;
};

// Get today's schedule for a student
export const getTodaySchedule = (studentId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Load student's curriculums
    const storageKey = `curriculums_${studentId}`;
    const savedCurriculums = localStorage.getItem(storageKey);
    if (!savedCurriculums) return [];

    const curriculums = JSON.parse(savedCurriculums);
    const todaySchedule = [];

    curriculums.forEach(curriculum => {
        const schedule = generateScheduleForDate(curriculum, today);
        if (schedule) {
            todaySchedule.push({
                curriculum,
                schedule
            });
        }
    });

    return todaySchedule;
};

// Get previous 2 days' words for review test
// Get previous days' words for review test based on reviewCycles
export const getPreviousReviewWords = (curriculum, currentDate, reviewCycles = 3) => {
    const { days, startDate, curriculumId } = curriculum;
    if (!days || !startDate) return [];

    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    const currentDateObj = new Date(currentDate);
    currentDateObj.setHours(0, 0, 0, 0);

    // Calculate current learning day index
    const daysDiff = Math.floor((currentDateObj - startDateObj) / (1000 * 60 * 60 * 24));
    if (daysDiff < 0) return [];

    const dayOfWeek = currentDateObj.getDay();
    const dayIds = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const currentDayId = dayIds[dayOfWeek];
    const currentDayIndex = days.indexOf(currentDayId);

    if (currentDayIndex === -1) return [];

    const weekOffset = Math.floor(daysDiff / 7);
    const currentLearningDay = weekOffset * days.length + currentDayIndex;


    // We need at least 1 previous learning day
    if (currentLearningDay < 1) return [];

    // Get words from previous learning days based on reviewCycles
    const allPreviousWords = [];

    for (let i = 1; i <= reviewCycles; i++) {
        const targetLearningDay = currentLearningDay - i;
        if (targetLearningDay < 0) continue;

        // Calculate the date for this learning day
        const targetWeek = Math.floor(targetLearningDay / days.length);
        const targetDayIndex = targetLearningDay % days.length;
        const targetDayId = days[targetDayIndex];

        // Find the actual calendar date
        const targetDate = new Date(startDateObj);
        targetDate.setDate(targetDate.getDate() + (targetWeek * 7));

        // Adjust to the correct day of week
        const targetDayOfWeek = dayIds.indexOf(targetDayId);
        // We need to find the date that matches targetDayId in that week
        // The targetDate is currently the start of the week (Sunday usually, or start date?)
        // Wait, logic above: targetDate.setDate(targetDate.getDate() + (targetWeek * 7));
        // This adds weeks to startDate.
        // We need to find the specific day in that week.

        // Let's rely on generateScheduleForDate to find the correct words for a learning day index?
        // Actually generateScheduleForDate takes a Date.
        // We need to reverse engineer the Date from learningDayIndex.

        // Simplified approach: Iterate back day by day until we find a learning day?
        // Or use the math:
        // StartDate + (targetWeek * 7) + (day difference to targetDayId)

        const startDayOfWeek = startDateObj.getDay(); // e.g. 1 (Mon)
        const targetDayOfWeekIndex = dayIds.indexOf(targetDayId); // e.g. 3 (Wed)

        // This logic is tricky because startDate might not be the first day of the week.
        // But let's assume standard weeks for now or just use the loop logic I had before which seemed to work for 2 days.

        // Previous logic:
        // const currentDayOfWeek = targetDate.getDay();
        // const dayDiff = targetDayOfWeek - currentDayOfWeek;
        // targetDate.setDate(targetDate.getDate() + dayDiff);

        // Let's stick to the previous logic but just loop 'reviewCycles' times.

        // Re-implementing the date calculation from previous logic:
        // targetDate is startDate + weeks.
        const currentDayOfWeekInTargetWeek = targetDate.getDay();
        const targetDayOfWeekVal = dayIds.indexOf(targetDayId);
        const diff = targetDayOfWeekVal - currentDayOfWeekInTargetWeek;
        targetDate.setDate(targetDate.getDate() + diff);

        // Get schedule for that date
        const schedule = generateScheduleForDate(curriculum, targetDate);
        if (schedule && schedule.words) {
            allPreviousWords.push(...schedule.words);
        }
    }

    return allPreviousWords;
};

// Generate schedule for a specific date
export const generateScheduleForDate = (curriculum, targetDate) => {
    const { days, startDate } = curriculum;
    if (!days || !startDate) return null;

    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    const targetDateObj = new Date(targetDate);
    targetDateObj.setHours(0, 0, 0, 0);

    // Calculate days difference
    const daysDiff = Math.floor((targetDateObj - startDateObj) / (1000 * 60 * 60 * 24));
    if (daysDiff < 0) return null; // Before start date

    // Check if target date is a learning day
    const dayOfWeek = targetDateObj.getDay();
    const dayIds = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const targetDayId = dayIds[dayOfWeek];

    const dayIndex = days.indexOf(targetDayId);
    if (dayIndex === -1) return null; // Not a learning day

    // Calculate which week and learning day number
    const weekOffset = Math.floor(daysDiff / 7);
    const learningDaysElapsed = weekOffset * days.length + dayIndex;

    // Load curriculum details
    const savedCurriculums = JSON.parse(localStorage.getItem('curriculums') || '[]');
    const curriculumDetail = savedCurriculums.find(c => c.id === curriculum.curriculumId);

    if (!curriculumDetail || !curriculumDetail.items || curriculumDetail.items.length === 0) {
        return null;
    }

    // Find which curriculum item we're on
    let daysIntoCurrentItem = learningDaysElapsed;
    let wordsForToday = [];
    let currentItem = null;

    for (let i = 0; i < curriculumDetail.items.length; i++) {
        const item = curriculumDetail.items[i];
        const wordbookId = item.wordbookId;
        const wordbookWords = JSON.parse(localStorage.getItem(`wordbook_words_${wordbookId}`) || '[]');
        const settings = item.settings;

        let daysNeededForItem = 0;
        let units = [];

        // Check if using unit-based pacing
        if (['0.5_unit', '1_unit', '2_units'].includes(settings.dailyGoal)) {
            units = getUnits(wordbookWords);
            const unitsPerDay = settings.dailyGoal === '0.5_unit' ? 0.5 : (settings.dailyGoal === '2_units' ? 2 : 1);
            daysNeededForItem = Math.ceil(units.length / unitsPerDay);
        } else {
            // Manual or fallback
            const dailyCount = settings.wordCount || 10;
            daysNeededForItem = Math.ceil(wordbookWords.length / dailyCount);
        }

        if (daysIntoCurrentItem < daysNeededForItem) {
            currentItem = item;

            // Calculate words for today
            if (units.length > 0) {
                const unitsPerDay = settings.dailyGoal === '0.5_unit' ? 0.5 : (settings.dailyGoal === '2_units' ? 2 : 1);

                if (settings.dailyGoal === '0.5_unit') {
                    // 0.5 unit per day logic
                    const unitIndex = Math.floor(daysIntoCurrentItem / 2);
                    if (unitIndex < units.length) {
                        const unit = units[unitIndex];
                        const isSecondHalf = daysIntoCurrentItem % 2 === 1;
                        const halfCount = Math.ceil(unit.count / 2);

                        if (!isSecondHalf) {
                            wordsForToday = unit.words.slice(0, halfCount);
                        } else {
                            wordsForToday = unit.words.slice(halfCount);
                        }
                    }
                } else {
                    // 1 or 2 units per day
                    const startUnitIndex = daysIntoCurrentItem * unitsPerDay;
                    const endUnitIndex = Math.min(startUnitIndex + unitsPerDay, units.length);

                    for (let u = startUnitIndex; u < endUnitIndex; u++) {
                        if (units[u]) {
                            wordsForToday = [...wordsForToday, ...units[u].words];
                        }
                    }
                }
            } else {
                // Manual count logic
                const dailyCount = settings.wordCount || 10;
                const startWordIndex = daysIntoCurrentItem * dailyCount;
                const endWordIndex = Math.min(startWordIndex + dailyCount, wordbookWords.length);
                wordsForToday = wordbookWords.slice(startWordIndex, endWordIndex);
            }
            break;
        } else {
            daysIntoCurrentItem -= daysNeededForItem;
        }
    }

    if (!currentItem || wordsForToday.length === 0) {
        return null;
    }

    // Extract unit information
    const uniqueMajors = [...new Set(wordsForToday.map(w => w.major).filter(Boolean))];
    const uniqueMinors = [...new Set(wordsForToday.map(w => w.minor).filter(Boolean))];
    const uniqueUnitNames = [...new Set(wordsForToday.map(w => w.unitName).filter(Boolean))];

    const majorDisplay = uniqueMajors.length > 0 ? uniqueMajors.join(', ') : '대단원 미지정';
    const minorDisplay = uniqueMinors.length > 0 ? uniqueMinors.join(', ') : '소단원 미지정';
    const unitNameDisplay = uniqueUnitNames.length > 0 ? uniqueUnitNames.join(', ') : '단원명 미지정';

    // Calculate word range
    let numberRange;
    const wordbookId = currentItem.wordbookId;
    const wordbookWords = JSON.parse(localStorage.getItem(`wordbook_words_${wordbookId}`) || '[]');

    if (wordsForToday.length > 0) {
        const firstWord = wordsForToday[0];
        const lastWord = wordsForToday[wordsForToday.length - 1];

        // If we have minor units, calculate position within the specific major+minor combination
        if (uniqueMinors.length > 0 && uniqueMajors.length > 0) {
            const currentMajor = uniqueMajors[0];
            const currentMinor = uniqueMinors[0];

            const wordsInSameUnit = wordbookWords.filter(w => w.major == currentMajor && w.minor == currentMinor);
            const firstWordInUnit = wordsInSameUnit.findIndex(w => w.number === firstWord.number);
            const lastWordInUnit = wordsInSameUnit.findIndex(w => w.number === lastWord.number);

            if (firstWordInUnit !== -1 && lastWordInUnit !== -1) {
                const startPos = firstWordInUnit + 1;
                const endPos = lastWordInUnit + 1;
                numberRange = `${startPos}~${endPos}`;
            } else {
                const firstIndex = wordbookWords.findIndex(w => w.number === firstWord.number);
                const lastIndex = wordbookWords.findIndex(w => w.number === lastWord.number);
                if (firstIndex !== -1 && lastIndex !== -1) {
                    numberRange = `${firstIndex + 1}~${lastIndex + 1}`;
                } else {
                    numberRange = `1~${wordsForToday.length}`;
                }
            }
        } else {
            const firstIndex = wordbookWords.findIndex(w => w.number === firstWord.number);
            const lastIndex = wordbookWords.findIndex(w => w.number === lastWord.number);
            if (firstIndex !== -1 && lastIndex !== -1) {
                numberRange = `${firstIndex + 1}~${lastIndex + 1}`;
            } else {
                numberRange = `1~${wordsForToday.length}`;
            }
        }
    } else {
        numberRange = '0~0';
    }

    return {
        textbook: currentItem.title || '단어장',
        major: majorDisplay,
        minor: minorDisplay,
        unitName: unitNameDisplay,
        wordRange: numberRange,
        wordCount: wordsForToday.length,
        words: wordsForToday,
        wordbookId: currentItem.wordbookId,
        dailyGoal: currentItem.settings.dailyGoal || 'manual',
        testType: currentItem.settings.testType || 'typing_english',
        passScore: currentItem.settings.passScore || 70,
        // Use local time for date string to avoid timezone shifts (e.g. KST midnight -> UTC previous day)
        date: `${targetDateObj.getFullYear()}-${String(targetDateObj.getMonth() + 1).padStart(2, '0')}-${String(targetDateObj.getDate()).padStart(2, '0')}`
    };
};

// Get incomplete lessons for a student
export const getIncompleteLessons = (student, curriculums, learningHistory) => {
    const incompleteLessons = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    curriculums.forEach(curriculum => {
        const { startDate, days } = curriculum;
        if (!startDate || !days) return;

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        // Iterate from start date to yesterday
        const current = new Date(start);
        while (current < today) {
            // Check if this date is a learning day
            const dayOfWeek = current.getDay();
            const dayIds = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            const dayId = dayIds[dayOfWeek];

            if (days.includes(dayId)) {
                // Check if completed
                const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;

                const isCompleted = learningHistory.some(h =>
                    h.curriculumId === curriculum.id && h.date === dateStr
                );

                if (!isCompleted) {
                    // Generate schedule details
                    const schedule = generateScheduleForDate(curriculum, current);
                    if (schedule) {
                        incompleteLessons.push({
                            id: `${curriculum.id}-${dateStr}`,
                            studentId: student.id,
                            studentName: student.name,
                            curriculumId: curriculum.id,
                            curriculumTitle: curriculum.title,
                            date: dateStr,
                            schedule: schedule
                        });
                    }
                }
            }
            current.setDate(current.getDate() + 1);
        }
    });

    return incompleteLessons;
};

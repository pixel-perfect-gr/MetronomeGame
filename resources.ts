import {ImageSource, Sound} from "excalibur";
import {hasProperty} from "unknown";
import {FontLoader} from "./font-loader.js";
import menuBlipMp3 from "./menu/blip.mp3";
import menuBlipOgg from "./menu/blip.ogg";
import menuItemRatings from "./menu/item-ratings.png";
import menuItem from "./menu/menu-item.png";
import menuSelectMp3 from "./menu/select.mp3";
import menuSelectOgg from "./menu/select.ogg";
import musicMp3 from "./music/music.mp3";
import musicOgg from "./music/music.ogg";
import performanceArm from "./performance/arm.png";
import performanceBackground from "./performance/background.png";
import performanceBigStarBlank from "./performance/big-star-blank.png";
import performanceBigStar from "./performance/big-star.png";
import performanceBooMp3 from "./performance/boo.mp3";
import performanceBooOgg from "./performance/boo.ogg";
import performanceCheerMp3 from "./performance/cheer.mp3";
import performanceCheerOgg from "./performance/cheer.ogg";
import performanceChimeMp3 from "./performance/chime.mp3";
import performanceChimeOgg from "./performance/chime.ogg";
import performanceFourMp3 from "./performance/four.mp3";
import performanceFourOgg from "./performance/four.ogg";
import performanceMissMp3 from "./performance/miss.mp3";
import performanceMissOgg from "./performance/miss.ogg";
import performanceOneMp3 from "./performance/one.mp3";
import performanceOneOgg from "./performance/one.ogg";
import performanceOverlay from "./performance/overlay.png";
import performanceReadyMp3 from "./performance/ready.mp3";
import performanceReadyOgg from "./performance/ready.ogg";
import performanceStar1Mp3 from "./performance/star1.mp3";
import performanceStar1Ogg from "./performance/star1.ogg";
import performanceStar2Mp3 from "./performance/star2.mp3";
import performanceStar2Ogg from "./performance/star2.ogg";
import performanceStar3Mp3 from "./performance/star3.mp3";
import performanceStar3Ogg from "./performance/star3.ogg";
import performanceThreeMp3 from "./performance/three.mp3";
import performanceThreeOgg from "./performance/three.ogg";
import performanceTickMp3 from "./performance/tick.mp3";
import performanceTickOgg from "./performance/tick.ogg";
import performanceTockMp3 from "./performance/tock.mp3";
import performanceTockOgg from "./performance/tock.ogg";
import performanceTwoMp3 from "./performance/two.mp3";
import performanceTwoOgg from "./performance/two.ogg";
import performanceVignette from "./performance/vignette.png";
import titleBackground from "./title/background.png";
import titleBigArm from "./title/big-arm.png";
import titleBody from "./title/body.png";
import titleLogo from "./title/logo.png";
import titleSmallArm from "./title/small-arm.png";

import p_base from "./NewImages/BASE.png";
import p_bg from "./NewImages/BG1.png";
import p_m_bg from "./NewImages/M_BG.png";
import p_metronome from "./NewImages/METRONOME.png";
import p_range from "./NewImages/RANGE_.png";
import p_bpm from "./NewImages/BPM.png";
import p_score from "./NewImages/SCORE.png";
import p_streak from "./NewImages/STREAK.png";
import p_ready from "./NewImages/Ready.png";
import p_gameOver from "./NewImages/Game_Over.png";
import p_font from "./NewImages/letters_nobg_2.png";
import p_Good from "./NewImages/Good.png";
import p_Miss from "./NewImages/Miss.png";
import p_Nice from "./NewImages/Nice.png";
import p_Perfect from "./NewImages/Perfect.png";
import p_leaderboard_bg from "./NewImages/Leaderboard_bg.png";
import p_leaderboard from "./NewImages/Leaderboard.png";
import p_iqos_logo from "./NewImages/iqos_logo.png";
import p_position from "./NewImages/position.png";
import p_name from "./NewImages/name.png";
import p_scoree from "./NewImages/scoree.png";

const resources = {
    font22px: new FontLoader("IQOSGreek-Regular", 22),
    font24px: new FontLoader("IQOSGreek-Regular", 24),
    font28px: new FontLoader("IQOSGreek-Regular", 28),
    font32px: new FontLoader("IQOSGreek-Regular", 32),
    font36px: new FontLoader("IQOSGreek-Regular", 36),
    font48px: new FontLoader("IQOSGreek-Regular", 48),
    font60px: new FontLoader("IQOSGreek-Regular", 60),
    font72px: new FontLoader("IQOSGreek-Regular", 72),
    menuBlip: new Sound(menuBlipOgg, menuBlipMp3),
    menuItemRatings: new ImageSource(menuItemRatings),
    menuItem: new ImageSource(menuItem),
    menuSelect: new Sound(menuSelectOgg, menuSelectMp3),
    music: new Sound(musicOgg, musicMp3),
    performanceArm: new ImageSource(performanceArm),
    performanceBackground: new ImageSource(performanceBackground),
    performanceBoo: new Sound(performanceBooOgg, performanceBooMp3),
    performanceBigStarBlank: new ImageSource(performanceBigStarBlank),
    performanceBigStar: new ImageSource(performanceBigStar),
    performanceCheer: new Sound(performanceCheerOgg, performanceCheerMp3),
    performanceChime: new Sound(performanceChimeOgg, performanceChimeMp3),
    performanceFour: new Sound(performanceFourOgg, performanceFourMp3),
    performanceMiss: new Sound(performanceMissOgg, performanceMissMp3),
    performanceOne: new Sound(performanceOneOgg, performanceOneMp3),
    performanceOverlay: new ImageSource(performanceOverlay),
    performanceReady: new Sound(performanceReadyOgg, performanceReadyMp3),
    performanceStar1: new Sound(performanceStar1Ogg, performanceStar1Mp3),
    performanceStar2: new Sound(performanceStar2Ogg, performanceStar2Mp3),
    performanceStar3: new Sound(performanceStar3Ogg, performanceStar3Mp3),
    performanceThree: new Sound(performanceThreeOgg, performanceThreeMp3),
    performanceTick: new Sound(performanceTickOgg, performanceTickMp3),
    performanceTock: new Sound(performanceTockOgg, performanceTockMp3),
    performanceTwo: new Sound(performanceTwoOgg, performanceTwoMp3),
    performanceVignette: new ImageSource(performanceVignette),
    titleBackground: new ImageSource(titleBackground),
    titleBigArm: new ImageSource(titleBigArm),
    titleBody: new ImageSource(titleBody),
    titleLogo: new ImageSource(titleLogo),
    titleSmallArm: new ImageSource(titleSmallArm),

    pp_base: new ImageSource(p_base),
    pp_bg: new ImageSource(p_bg),
    pp_m_bg: new ImageSource(p_m_bg),
    pp_metronome: new ImageSource(p_metronome),
    pp_range: new ImageSource(p_range),
    pp_bpm: new ImageSource(p_bpm),
    pp_score: new ImageSource(p_score),
    pp_streak: new ImageSource(p_streak),
    pp_ready: new ImageSource(p_ready),
    pp_gameover: new ImageSource(p_gameOver),
    lettersFont: new ImageSource(p_font),
    pp_good: new ImageSource(p_Good),
    pp_miss: new ImageSource(p_Miss),
    pp_nice: new ImageSource(p_Nice),
    pp_perfect: new ImageSource(p_Perfect),
    pp_leaderboard_bg: new ImageSource(p_leaderboard_bg),
    pp_leaderboard: new ImageSource(p_leaderboard),
    pp_iqos_logo: new ImageSource(p_iqos_logo),
    pp_position: new ImageSource(p_position),
    pp_name: new ImageSource(p_name),
    pp_scoree: new ImageSource(p_scoree),
    geologicaFont: new FontLoader("Geologica", 32)


};

// Hack: Don't add cache-busting query parameters to requests.
Object.values(resources).forEach((resource: unknown) => {
    if (hasProperty(resource, "_resource") && hasProperty(resource._resource, "bustCache")) {
        resource._resource.bustCache = false;
    }
});

export default resources;

export async function fetchPlayerName(): Promise<string> {
    try {
        const response = await fetch("/playerName.txt", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch name");
        const text = (await response.text()).trim();
        return text || "Unknown";
    } catch (err) {
        console.error("Failed to load player name:", err);
        return "Unknown";
    }
}





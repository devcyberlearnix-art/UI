# ASIVO LMS — VERSION 27
## Deliverable 9: Production Build Report
**Build Engines:** Vite 5.4.21 (Frontend), Gradle 8.11 / Java 21 (Backend)  
**Frontend Directory:** `C:\Users\SHIVASAI\OneDrive\Desktop\FD_LMS\UI`  
**Backend Directory:** `C:\Users\SHIVASAI\OneDrive\Desktop\LMS\user-service`  
**Build Verdict:** 100% CLEAN PRODUCTION BUILDS

---

## 1. Frontend Production Build Output

```text
> lms@0.0.0 build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 2602 modules transformed.
Generated an empty chunk: "utils".
rendering chunks...
computing gzip size...
dist/index.html                                    3.62 kB │ gzip:   1.24 kB
dist/assets/index-BYS33EjE.css                   127.94 kB │ gzip:  19.07 kB
dist/assets/utils-l0sNRNKZ.js                      0.00 kB │ gzip:   0.02 kB
dist/assets/forms-CAtdRzlP.js                      0.04 kB │ gzip:   0.06 kB
dist/assets/CertificatePage-BGCh_pw7.js            0.26 kB │ gzip:   0.20 kB
dist/assets/Moderation-CGy7RuUs.js                 0.40 kB │ gzip:   0.29 kB
dist/assets/Support-Eyrn3nuZ.js                    0.41 kB │ gzip:   0.30 kB
dist/assets/Gamification-D4XBCm3j.js               0.41 kB │ gzip:   0.30 kB
dist/assets/AIFeatures-BjKRvB8c.js                 0.41 kB │ gzip:   0.31 kB
dist/assets/assignmentApi-D_w7JE1a.js              2.12 kB │ gzip:   0.71 kB
dist/assets/liveClassApi-bZcXkqv2.js               3.18 kB │ gzip:   0.54 kB
dist/assets/Analytics-BPUvmEfO.js                  3.42 kB │ gzip:   1.43 kB
dist/assets/useAdmin-1Ahv3dRD.js                   3.43 kB │ gzip:   1.43 kB
dist/assets/useAssessments-D6otuPKc.js             3.61 kB │ gzip:   1.37 kB
dist/assets/quizApi-DFI9WEq-.js                    3.92 kB │ gzip:   0.83 kB
dist/assets/OrderDetails-DM-TCn0t.js               4.25 kB │ gzip:   1.30 kB
dist/assets/RevisionHistory-BCVVIUO6.js            4.60 kB │ gzip:   1.69 kB
dist/assets/MediaLibrary-DkN9OLVd.js               4.62 kB │ gzip:   1.87 kB
dist/assets/SEOEditor-CVdu1rLt.js                  5.38 kB │ gzip:   1.66 kB
dist/assets/FooterEditor-C-BcoWV3.js               5.42 kB │ gzip:   1.84 kB
dist/assets/NotificationPreferences-D-QzDQMl.js    6.00 kB │ gzip:   2.17 kB
dist/assets/LiveClassPage-iMGhhelW.js              6.19 kB │ gzip:   2.06 kB
dist/assets/Reviews-DzywMsMW.js                    6.20 kB │ gzip:   2.31 kB
dist/assets/NotificationPage-BBsDHPoy.js           6.49 kB │ gzip:   2.26 kB
dist/assets/SiteSettingsEditor-CtBC6zcq.js         6.52 kB │ gzip:   1.77 kB
dist/assets/TestimonialEditor-B-IRW-Qo.js          7.01 kB │ gzip:   2.16 kB
dist/assets/Settings-HfV_4Ile.js                   7.25 kB │ gzip:   1.89 kB
dist/assets/QuizPage-B-1qjAHB.js                   7.31 kB │ gzip:   2.72 kB
dist/assets/Analytics-D_vG48nZ.js                  7.95 kB │ gzip:   2.39 kB
dist/assets/Certificates-CIZireM1.js               8.15 kB │ gzip:   2.89 kB
dist/assets/Assignments-B1NZWbVr.js                8.40 kB │ gzip:   2.89 kB
dist/assets/ReviewPage-D2gF9Lzy.js                 8.40 kB │ gzip:   2.58 kB
dist/assets/SubDashboard-Bt5V4qSB.js               8.47 kB │ gzip:   2.61 kB
dist/assets/Payments-CvKmH6zR.js                   8.99 kB │ gzip:   2.29 kB
dist/assets/Assignments-CBuUAqkB.js                9.32 kB │ gzip:   2.63 kB
dist/assets/WebsiteManagementHub-hQ3PeF0Y.js       9.59 kB │ gzip:   3.09 kB
dist/assets/adminApi-DVKf-yjh.js                   9.77 kB │ gzip:   1.91 kB
dist/assets/AdminManagement-jlzqR5Hy.js           10.01 kB │ gzip:   2.86 kB
dist/assets/MyLearning-Bc84ygfq.js                10.70 kB │ gzip:   3.68 kB
dist/assets/SectionManager-DN8QkmZn.js            11.41 kB │ gzip:   3.18 kB
dist/assets/MyCourses-D3CKwYow.js                 12.01 kB │ gzip:   3.60 kB
dist/assets/Notifications-Czdgeztm.js             12.25 kB │ gzip:   3.11 kB
dist/assets/LiveClassrooms-A3o6fvOI.js            12.64 kB │ gzip:   4.42 kB
dist/assets/Dashboard-hdCYL7YA.js                 12.93 kB │ gzip:   3.39 kB
dist/assets/HeroEditor-D-uRRu5Z.js                13.27 kB │ gzip:   4.14 kB
dist/assets/Roles-uJE0EPnA.js                     13.31 kB │ gzip:   3.56 kB
dist/assets/NavigationEditor-Bk1cnfl2.js          13.45 kB │ gzip:   3.94 kB
dist/assets/Reports-BWF7twy1.js                   14.00 kB │ gzip:   4.07 kB
dist/assets/Instructors-C97HwMue.js               14.50 kB │ gzip:   3.89 kB
dist/assets/Dashboard-Cakw5X1W.js                 15.18 kB │ gzip:   4.77 kB
dist/assets/Profile-Dgmc2rFQ.js                   15.84 kB │ gzip:   3.89 kB
dist/assets/StatisticsEditor-BTLODKp3.js          16.59 kB │ gzip:   4.84 kB
dist/assets/CertificateVerification-DIvJPEk7.js   17.16 kB │ gzip:   5.40 kB
dist/assets/AdminRegister-CPjtSt5V.js             17.82 kB │ gzip:   4.52 kB
dist/assets/InstructorApplications-Cu0uVmdZ.js    20.92 kB │ gzip:   5.15 kB
dist/assets/Users-CSYC3xbW.js                     25.00 kB │ gzip:   6.43 kB
dist/assets/AdminCommandCenter-DbUxOysW.js        25.29 kB │ gzip:   7.23 kB
dist/assets/Coupons-n3rDLKpH.js                   25.66 kB │ gzip:   5.28 kB
dist/assets/StudentDashboard-DbkaUJ92.js          26.18 kB │ gzip:   6.43 kB
dist/assets/Orders-BU-dBVQ2.js                    28.01 kB │ gzip:   7.08 kB
dist/assets/BannerManagement-Dg_d5qtk.js          29.40 kB │ gzip:   6.89 kB
dist/assets/Courses-B--sU11C.js                   37.96 kB │ gzip:   8.16 kB
dist/assets/InstructorApplication-DvCvpIbd.js     44.71 kB │ gzip:   9.61 kB
dist/assets/CreateCourse-CDxpwOrY.js              47.61 kB │ gzip:  11.93 kB
dist/assets/ClassroomView-BkaiNIeI.js             51.59 kB │ gzip:  16.00 kB
dist/assets/icons-EMpWOw_B.js                     55.08 kB │ gzip:   9.93 kB
dist/assets/motion-vendor-B8_0GPSd.js            102.05 kB │ gzip:  34.44 kB
dist/assets/react-vendor-nKSA-9Iq.js             164.83 kB │ gzip:  53.80 kB
dist/assets/charts-JCHqQGBx.js                   402.11 kB │ gzip: 116.62 kB
dist/assets/index-B0kwGzWo.js                    597.36 kB │ gzip: 149.27 kB

✓ built in 12.72s
```

---

## 2. Backend BootJar Compilation Output

```text
> Task :user-service:processResources UP-TO-DATE
> Task :commonlibs:compileJava UP-TO-DATE
> Task :commonlibs:processResources NO-SOURCE
> Task :commonlibs:classes UP-TO-DATE
> Task :commonlibs:jar UP-TO-DATE
> Task :user-service:compileJava
> Task :user-service:classes
> Task :user-service:resolveMainClassName
> Task :user-service:bootJar

BUILD SUCCESSFUL in 39s
6 actionable tasks: 3 executed, 3 up-to-date
```

---

## 3. Bundle Analysis

* **Target Page Chunk:** `dist/assets/InstructorApplication-DvCvpIbd.js`
  * Raw Size: `44.71 kB`
  * Gzipped Size: `9.61 kB`
  * Code-Splitting: Lazy loaded via `React.lazy` and `Suspense` on `/instructor/apply` route.
  * Vendor Footprint: Fully optimized tree-shaken Lucide icons and Axios client.

# Testing matrix

| ID | Scenario | Expected |
|---|---|---|
| TC01 | Registration | 201 + JWT |
| TC02 | Duplicate registration | 409 |
| TC03 | Valid login | 200 + JWT |
| TC04 | Invalid login | 401 |
| TC05 | Profile update | saved profile |
| TC06-08 | Add/update/delete skill | correct ownership + CRUD |
| TC09 | Goal | progress starts 0% |
| TC10-12 | Practice/progress/milestone | values update automatically |
| TC13-14 | Valid/invalid file | accepted/rejected by type/size |
| TC15-16 | Post/feed | post visible |
| TC17-19 | Like/duplicate/unlike | one like maximum |
| TC20-21 | Comment/unauthorized deletion | correct permission behavior |
| TC22 | Analytics | totals/streak/engagement |
| TC23 | User isolation | other user's records inaccessible |
| TC24-26 | Storage/DB/token failures | controlled errors |
| TC27 | Logout | client token removed |

Run `pytest -q` from `backend`.
